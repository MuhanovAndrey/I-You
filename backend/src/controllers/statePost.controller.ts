import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import telegramService, { NotificationType } from '../services/telegram.service';

export const createStatePostValidation = [
  body('type').isIn(['physical', 'emotional']).withMessage('Type must be physical or emotional'),
  body('content').notEmpty().withMessage('Content is required')
];

export const createStatePost = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, content } = req.body;
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'You need to be paired with someone first' });
    }

    const statePost = await prisma.statePost.create({
      data: { userId, type, content },
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
      type: NotificationType.STATE_POST,
      fromUserId: userId,
      toUserId: user.pairedWithId,
      content: content
    });

    res.status(201).json(statePost);
  } catch (error) {
    console.error('Create state post error:', error);
    res.status(500).json({ error: 'Error creating state post' });
  }
};

export const getStatePosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'You need to be paired with someone first' });
    }

    const statePosts = await prisma.statePost.findMany({
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

    res.json(statePosts);
  } catch (error) {
    console.error('Get state posts error:', error);
    res.status(500).json({ error: 'Error fetching state posts' });
  }
};

export const deleteStatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const statePost = await prisma.statePost.findUnique({
      where: { id }
    });

    if (!statePost) {
      return res.status(404).json({ error: 'State post not found' });
    }

    if (statePost.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.statePost.delete({ where: { id } });

    res.json({ message: 'State post deleted' });
  } catch (error) {
    console.error('Delete state post error:', error);
    res.status(500).json({ error: 'Error deleting state post' });
  }
};
