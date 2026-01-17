import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  createReaction, 
  deleteReaction,
  createReactionValidation 
} from '../controllers/reaction.controller';

const router = Router();

router.post('/', authenticate, createReactionValidation, createReaction);
router.delete('/:id', authenticate, deleteReaction);

export default router;
