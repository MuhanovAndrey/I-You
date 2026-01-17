import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import telegramService, { NotificationType } from '../services/telegram.service';

export const sendPairingRequestValidation = [
  body('targetUsername').notEmpty().withMessage('Target username is required')
];

export const sendPairingRequest = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { targetUsername } = req.body;
    const userId = req.userId!;

    // Check if user is already paired
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { pairedWithId: true, username: true }
    });

    if (currentUser?.pairedWithId) {
      return res.status(400).json({ error: 'You are already paired with someone' });
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true, pairedWithId: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.id === userId) {
      return res.status(400).json({ error: 'You cannot pair with yourself' });
    }

    if (targetUser.pairedWithId) {
      return res.status(400).json({ error: 'This user is already paired with someone' });
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
      return res.status(400).json({ error: 'A pairing request already exists between you two' });
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
    res.status(500).json({ error: 'Error sending pairing request' });
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
    res.status(500).json({ error: 'Error fetching pairing requests' });
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
      return res.status(404).json({ error: 'Pairing request not found' });
    }

    if (request.toUserId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    if (accept) {
      // Check if either user is already paired
      if (request.fromUser.pairedWithId || request.toUser.pairedWithId) {
        return res.status(400).json({ error: 'One of you is already paired with someone' });
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

      res.json({ message: 'Pairing request accepted', paired: true });
    } else {
      await prisma.pairingRequest.update({
        where: { id },
        data: { status: 'rejected' }
      });

      res.json({ message: 'Pairing request rejected' });
    }
  } catch (error) {
    console.error('Respond to pairing request error:', error);
    res.status(500).json({ error: 'Error responding to pairing request' });
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
      return res.status(400).json({ error: 'You are not paired with anyone' });
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

    res.json({ message: 'Successfully unpaired' });
  } catch (error) {
    console.error('Unpair error:', error);
    res.status(500).json({ error: 'Error unpairing' });
  }
};
