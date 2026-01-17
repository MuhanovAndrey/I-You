import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import telegramService, { NotificationType } from '../services/telegram.service';

export const createGiftIdeaValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString()
];

export const createGiftIdea = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'You need to be paired with someone first' });
    }

    const giftIdea = await prisma.giftIdea.create({
      data: { userId, title, description },
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

    await telegramService.sendNotification({
      type: NotificationType.GIFT_IDEA,
      fromUserId: userId,
      toUserId: user.pairedWithId,
      content: title
    });

    res.status(201).json(giftIdea);
  } catch (error) {
    console.error('Create gift idea error:', error);
    res.status(500).json({ error: 'Error creating gift idea' });
  }
};

export const getGiftIdeas = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'You need to be paired with someone first' });
    }

    const giftIdeas = await prisma.giftIdea.findMany({
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

    res.json(giftIdeas);
  } catch (error) {
    console.error('Get gift ideas error:', error);
    res.status(500).json({ error: 'Error fetching gift ideas' });
  }
};

export const deleteGiftIdea = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const giftIdea = await prisma.giftIdea.findUnique({
      where: { id }
    });

    if (!giftIdea) {
      return res.status(404).json({ error: 'Gift idea not found' });
    }

    if (giftIdea.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.giftIdea.delete({ where: { id } });

    res.json({ message: 'Gift idea deleted' });
  } catch (error) {
    console.error('Delete gift idea error:', error);
    res.status(500).json({ error: 'Error deleting gift idea' });
  }
};
