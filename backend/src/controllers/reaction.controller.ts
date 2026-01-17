import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import telegramService, { NotificationType } from '../services/telegram.service';

export const createReactionValidation = [
  body('type').notEmpty().withMessage('Reaction type is required'),
  body('targetType').isIn(['loveReason', 'giftIdea', 'statePost', 'comment']).withMessage('Invalid target type'),
  body('targetId').notEmpty().withMessage('Target ID is required')
];

export const createReaction = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, targetType, targetId } = req.body;
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pairedWithId: true }
    });

    if (!user?.pairedWithId) {
      return res.status(400).json({ error: 'You need to be paired with someone first' });
    }

    // Build the reaction data based on target type
    const reactionData: any = {
      userId,
      type,
      [`${targetType}Id`]: targetId
    };

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findFirst({
      where: reactionData
    });

    if (existingReaction) {
      // Remove reaction (toggle)
      await prisma.reaction.delete({ where: { id: existingReaction.id } });
      return res.json({ message: 'Reaction removed' });
    }

    const reaction = await prisma.reaction.create({
      data: reactionData,
      include: {
        user: {
          select: { id: true, username: true }
        }
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
    } else if (targetType === 'comment') {
      const target = await prisma.comment.findUnique({ where: { id: targetId }, select: { userId: true } });
      targetOwnerId = target?.userId || null;
    }

    if (targetOwnerId && targetOwnerId !== userId) {
      await telegramService.sendNotification({
        type: NotificationType.REACTION,
        fromUserId: userId,
        toUserId: targetOwnerId
      });
    }

    res.status(201).json(reaction);
  } catch (error) {
    console.error('Create reaction error:', error);
    res.status(500).json({ error: 'Error creating reaction' });
  }
};

export const deleteReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const reaction = await prisma.reaction.findUnique({
      where: { id }
    });

    if (!reaction) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    if (reaction.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.reaction.delete({ where: { id } });

    res.json({ message: 'Reaction deleted' });
  } catch (error) {
    console.error('Delete reaction error:', error);
    res.status(500).json({ error: 'Error deleting reaction' });
  }
};
