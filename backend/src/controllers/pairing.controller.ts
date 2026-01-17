import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import telegramService, { NotificationType } from '../services/telegram.service';

export const sendPairingRequestValidation = [
  body().custom((value) => {
    const targetTelegramUsername = value?.targetTelegramUsername;
    const targetUsername = value?.targetUsername;
    if ((typeof targetTelegramUsername === 'string' && targetTelegramUsername.trim()) || (typeof targetUsername === 'string' && targetUsername.trim())) {
      return true;
    }
    throw new Error('Укажите имя пользователя Telegram');
  })
];

const normalizeTelegramUsername = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withoutAt = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  return withoutAt.trim() || null;
};

export const sendPairingRequest = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0]?.msg ?? 'Некорректные данные' });
    }

    const targetTelegramUsername = normalizeTelegramUsername(req.body.targetTelegramUsername);
    const fallbackUsername = typeof req.body.targetUsername === 'string' ? req.body.targetUsername.trim() : null;
    const userId = req.userId!;

    // Check if user is already paired
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { pairedWithId: true, username: true }
    });

    if (currentUser?.pairedWithId) {
      return res.status(400).json({ error: 'Вы уже связаны с другим пользователем' });
    }

    // Find target user
    const targetUser = await prisma.user.findFirst({
      where: targetTelegramUsername
        ? { telegramUsername: { equals: targetTelegramUsername, mode: 'insensitive' } }
        : { username: fallbackUsername || '' },
      select: { id: true, pairedWithId: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (targetUser.id === userId) {
      return res.status(400).json({ error: 'Нельзя отправить запрос самому себе' });
    }

    if (targetUser.pairedWithId) {
      return res.status(400).json({ error: 'Этот пользователь уже связан с кем-то' });
    }

    // Check for existing request
    const existingRequest = await prisma.pairingRequest.findFirst({
      where: {
        OR: [
          { fromUserId: userId, toUserId: targetUser.id },
          { fromUserId: targetUser.id, toUserId: userId }
        ],
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Запрос на связь между вами уже существует' });
    }

    const pairingRequest = await prisma.pairingRequest.create({
      data: {
        fromUserId: userId,
        toUserId: targetUser.id
      },
      include: {
        fromUser: {
          select: { id: true, username: true }
        },
        toUser: {
          select: { id: true, username: true }
        }
      }
    });

    // Send Telegram notification
    await telegramService.sendNotification({
      type: NotificationType.PAIRING_REQUEST,
      fromUserId: userId,
      toUserId: targetUser.id
    });

    res.status(201).json(pairingRequest);
  } catch (error) {
    console.error('Send pairing request error:', error);
    res.status(500).json({ error: 'Ошибка отправки запроса на связь' });
  }
};

export const getPairingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const requests = await prisma.pairingRequest.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      include: {
        fromUser: {
          select: { id: true, username: true }
        },
        toUser: {
          select: { id: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Get pairing requests error:', error);
    res.status(500).json({ error: 'Ошибка получения запросов' });
  }
};

export const respondToPairingRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { accept } = req.body;
    const userId = req.userId!;

    const request = await prisma.pairingRequest.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: { id: true, pairedWithId: true }
        },
        toUser: {
          select: { id: true, pairedWithId: true }
        }
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Запрос на связь не найден' });
    }

    if (request.toUserId !== userId) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Запрос уже обработан' });
    }

    if (accept) {
      // Check if either user is already paired
      if (request.fromUser.pairedWithId || request.toUser.pairedWithId) {
        return res.status(400).json({ error: 'Кто-то из вас уже связан с другим пользователем' });
      }

      // Update both users to be paired
      await prisma.$transaction([
        prisma.user.update({
          where: { id: request.fromUserId },
          data: { pairedWithId: request.toUserId }
        }),
        prisma.user.update({
          where: { id: request.toUserId },
          data: { pairedWithId: request.fromUserId }
        }),
        prisma.pairingRequest.update({
          where: { id },
          data: { status: 'accepted' }
        })
      ]);

      // Send notification to requester
      await telegramService.sendNotification({
        type: NotificationType.PAIRING_ACCEPTED,
        fromUserId: userId,
        toUserId: request.fromUserId
      });

      res.json({ message: 'Запрос принят', paired: true });
    } else {
      await prisma.pairingRequest.update({
        where: { id },
        data: { status: 'rejected' }
      });

      res.json({ message: 'Запрос отклонён' });
    }
  } catch (error) {
    console.error('Respond to pairing request error:', error);
    res.status(500).json({ error: 'Ошибка ответа на запрос' });
  }
};

export const unpair = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'Вы ни с кем не связаны' });
    }

    // Unpair both users
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { pairedWithId: null }
      }),
      prisma.user.update({
        where: { id: user.pairedWithId },
        data: { pairedWithId: null }
      })
    ]);

    res.json({ message: 'Связь успешно удалена' });
  } catch (error) {
    console.error('Unpair error:', error);
    res.status(500).json({ error: 'Ошибка удаления связи' });
  }
};
