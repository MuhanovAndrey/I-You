import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

const prismaAny = prisma as any;

const getPairedWithOrThrow = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pairedWithId: true }
  });

  if (!user?.pairedWithId) {
    const error = new Error('You need to be paired with someone first');
    (error as any).status = 400;
    throw error;
  }

  return user.pairedWithId;
};

const goalPairWhere = (userId: string, pairedWithId: string) => ({
  OR: [
    { ownerUserId: userId, partnerUserId: pairedWithId },
    { ownerUserId: pairedWithId, partnerUserId: userId }
  ]
});

export const createSharedGoalValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('items').optional().isArray(),
  body('items.*').optional().isString().notEmpty()
];

export const createSharedGoal = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId!;
    const pairedWithId = await getPairedWithOrThrow(userId);

    const { title, description, items } = req.body as {
      title: string;
      description?: string;
      items?: string[];
    };

    const goal = await prismaAny.sharedGoal.create({
      data: {
        ownerUserId: userId,
        partnerUserId: pairedWithId,
        title,
        description,
        items: items?.length
          ? {
              create: items.map((content, index) => ({
                content,
                order: index
              }))
            }
          : undefined
      },
      include: {
        items: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }
      }
    });

    res.status(201).json(goal);
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 500) console.error('Create shared goal error:', error);
    res.status(status).json({ error: error?.message || 'Error creating shared goal' });
  }
};

export const getSharedGoals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const pairedWithId = await getPairedWithOrThrow(userId);

    const goals = await prismaAny.sharedGoal.findMany({
      where: {
        ...goalPairWhere(userId, pairedWithId),
        isArchived: false
      },
      include: {
        items: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(goals);
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 500) console.error('Get shared goals error:', error);
    res.status(status).json({ error: error?.message || 'Error fetching shared goals' });
  }
};

export const updateSharedGoalValidation = [
  body('title').optional().isString().notEmpty(),
  body('description').optional().isString(),
  body('isArchived').optional().isBoolean()
];

export const updateSharedGoal = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId!;
    const pairedWithId = await getPairedWithOrThrow(userId);
    const { id } = req.params;

    const existing = await prismaAny.sharedGoal.findFirst({
      where: {
        id,
        ...goalPairWhere(userId, pairedWithId)
      },
      select: { id: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const { title, description, isArchived } = req.body as {
      title?: string;
      description?: string;
      isArchived?: boolean;
    };

    const updated = await prismaAny.sharedGoal.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isArchived !== undefined ? { isArchived } : {})
      },
      include: {
        items: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }
      }
    });

    res.json(updated);
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 500) console.error('Update shared goal error:', error);
    res.status(status).json({ error: error?.message || 'Error updating shared goal' });
  }
};

export const deleteSharedGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const pairedWithId = await getPairedWithOrThrow(userId);
    const { id } = req.params;

    const existing = await prismaAny.sharedGoal.findFirst({
      where: {
        id,
        ...goalPairWhere(userId, pairedWithId)
      },
      select: { id: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prismaAny.sharedGoal.delete({ where: { id } });

    res.json({ message: 'Goal deleted' });
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 500) console.error('Delete shared goal error:', error);
    res.status(status).json({ error: error?.message || 'Error deleting goal' });
  }
};

export const addSharedGoalItemValidation = [
  body('content').notEmpty().withMessage('Content is required'),
  body('order').optional().isInt({ min: 0 })
];

export const addSharedGoalItem = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId!;
    const pairedWithId = await getPairedWithOrThrow(userId);

    const { id } = req.params; // goalId
    const { content, order } = req.body as { content: string; order?: number };

    const goal = await prismaAny.sharedGoal.findFirst({
      where: {
        id,
        ...goalPairWhere(userId, pairedWithId),
        isArchived: false
      },
      select: { id: true }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const item = await prismaAny.sharedGoalItem.create({
      data: {
        goalId: id,
        content,
        order: typeof order === 'number' ? order : 0
      }
    });

    res.status(201).json(item);
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 500) console.error('Add shared goal item error:', error);
    res.status(status).json({ error: error?.message || 'Error adding item' });
  }
};

export const updateSharedGoalItemValidation = [
  body('content').optional().isString().notEmpty(),
  body('isDone').optional().isBoolean(),
  body('order').optional().isInt({ min: 0 })
];

export const updateSharedGoalItem = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.userId!;
    const pairedWithId = await getPairedWithOrThrow(userId);

    const { goalId, itemId } = req.params;

    const goal = await prismaAny.sharedGoal.findFirst({
      where: {
        id: goalId,
        ...goalPairWhere(userId, pairedWithId),
        isArchived: false
      },
      select: { id: true }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const existingItem = await prismaAny.sharedGoalItem.findFirst({
      where: { id: itemId, goalId },
      select: { id: true, isDone: true, doneByUserId: true, doneAt: true }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { content, isDone, order } = req.body as {
      content?: string;
      isDone?: boolean;
      order?: number;
    };

    const shouldToggle =
      typeof isDone !== 'boolean' &&
      content === undefined &&
      order === undefined;

    const nextIsDone =
      typeof isDone === 'boolean'
        ? isDone
        : shouldToggle
          ? !existingItem.isDone
          : existingItem.isDone;

    const isDoneChanged = nextIsDone !== existingItem.isDone;

    const updated = await prismaAny.sharedGoalItem.update({
      where: { id: itemId },
      data: {
        ...(content !== undefined ? { content } : {}),
        ...(order !== undefined ? { order } : {}),
        isDone: nextIsDone,
        ...(isDoneChanged
          ? {
              doneByUserId: nextIsDone ? userId : null,
              doneAt: nextIsDone ? new Date() : null
            }
          : {})
      }
    });

    res.json(updated);
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 500) console.error('Update shared goal item error:', error);
    res.status(status).json({ error: error?.message || 'Error updating item' });
  }
};

export const deleteSharedGoalItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const pairedWithId = await getPairedWithOrThrow(userId);

    const { goalId, itemId } = req.params;

    const goal = await prismaAny.sharedGoal.findFirst({
      where: {
        id: goalId,
        ...goalPairWhere(userId, pairedWithId)
      },
      select: { id: true }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const existingItem = await prismaAny.sharedGoalItem.findFirst({
      where: { id: itemId, goalId },
      select: { id: true }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await prismaAny.sharedGoalItem.delete({ where: { id: itemId } });

    res.json({ message: 'Item deleted' });
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 500) console.error('Delete shared goal item error:', error);
    res.status(status).json({ error: error?.message || 'Error deleting item' });
  }
};
