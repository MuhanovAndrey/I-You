import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import telegramService, { NotificationType } from '../services/telegram.service';

export const createLoveReasonValidation = [
  body('content').notEmpty().withMessage('Content is required')
];

export const createLoveReason = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const userId = req.userId!;

    // Get user with paired partner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'You need to be paired with someone first' });
    }

    const loveReason = await prisma.loveReason.create({
      data: { userId, content },
      include: {
        user: {
          select: { id: true, username: true }
        },
        reactions: true,
        comments: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });

    // Send Telegram notification
    await telegramService.sendNotification({
      type: NotificationType.LOVE_REASON,
      fromUserId: userId,
      toUserId: user.pairedWithId,
      content: content
    });

    res.status(201).json(loveReason);
  } catch (error) {
    console.error('Create love reason error:', error);
    res.status(500).json({ error: 'Error creating love reason' });
  }
};

export const getLoveReasons = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Get user's paired partner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'You need to be paired with someone first' });
    }

    const loveReasons = await prisma.loveReason.findMany({
      where: {
        OR: [
          { userId: userId },
          { userId: user.pairedWithId }
        ]
      },
      include: {
        user: {
          select: { id: true, username: true }
        },
        reactions: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(loveReasons);
  } catch (error) {
    console.error('Get love reasons error:', error);
    res.status(500).json({ error: 'Error fetching love reasons' });
  }
};

export const deleteLoveReason = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const loveReason = await prisma.loveReason.findUnique({
      where: { id }
    });

    if (!loveReason) {
      return res.status(404).json({ error: 'Love reason not found' });
    }

    if (loveReason.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.loveReason.delete({ where: { id } });

    res.json({ message: 'Love reason deleted' });
  } catch (error) {
    console.error('Delete love reason error:', error);
    res.status(500).json({ error: 'Error deleting love reason' });
  }
};
