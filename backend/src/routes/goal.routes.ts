import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  addSharedGoalItem,
  addSharedGoalItemValidation,
  createSharedGoal,
  createSharedGoalValidation,
  deleteSharedGoal,
  deleteSharedGoalItem,
  getSharedGoals,
  updateSharedGoal,
  updateSharedGoalItem,
  updateSharedGoalItemValidation,
  updateSharedGoalValidation
} from '../controllers/goal.controller';

const router = Router();

router.get('/', authenticate, getSharedGoals);
router.post('/', authenticate, createSharedGoalValidation, createSharedGoal);
router.patch('/:id', authenticate, updateSharedGoalValidation, updateSharedGoal);
router.delete('/:id', authenticate, deleteSharedGoal);

router.post('/:id/items', authenticate, addSharedGoalItemValidation, addSharedGoalItem);
router.patch('/:goalId/items/:itemId', authenticate, updateSharedGoalItemValidation, updateSharedGoalItem);
router.delete('/:goalId/items/:itemId', authenticate, deleteSharedGoalItem);

export default router;
