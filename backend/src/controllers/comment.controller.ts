import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import telegramService, { NotificationType } from '../services/telegram.service';

export const createCommentValidation = [
  body('content').notEmpty().withMessage('Comment content is required'),
  body('targetType').isIn(['loveReason', 'giftIdea', 'statePost']).withMessage('Invalid target type'),
  body('targetId').notEmpty().withMessage('Target ID is required')
];

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, targetType, targetId } = req.body;
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'You need to be paired with someone first' });
    }

    const commentData: any = {
      userId,
      content,
      [`${targetType}Id`]: targetId
    };

    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        user: {
          select: { id: true, username: true }
        },
        reactions: true
      }
    });

    // Get the owner of the target to send notification
    let targetOwnerId: string | null = null;
    
    if (targetType === 'loveReason') {
      const target = await prisma.loveReason.findUnique({ where: { id: targetId }, select: { userId: true } });
      targetOwnerId = target?.userId || null;
    } else if (targetType === 'giftIdea') {
      const target = await prisma.giftIdea.findUnique({ where: { id: targetId }, select: { userId: true } });
      targetOwnerId = target?.userId || null;
    } else if (targetType === 'statePost') {
      const target = await prisma.statePost.findUnique({ where: { id: targetId }, select: { userId: true } });
      targetOwnerId = target?.userId || null;
    }

    if (targetOwnerId && targetOwnerId !== userId) {
      await telegramService.sendNotification({
        type: NotificationType.COMMENT,
        fromUserId: userId,
        toUserId: targetOwnerId,
        content: content
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Error creating comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.comment.delete({ where: { id } });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Error deleting comment' });
  }
};
