import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  createGiftIdea, 
  getGiftIdeas, 
  deleteGiftIdea,
  createGiftIdeaValidation 
} from '../controllers/giftIdea.controller';

const router = Router();

router.post('/', authenticate, createGiftIdeaValidation, createGiftIdea);
router.get('/', authenticate, getGiftIdeas);
router.delete('/:id', authenticate, deleteGiftIdea);

export default router;
