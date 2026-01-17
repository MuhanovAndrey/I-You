import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  createStatePost, 
  getStatePosts, 
  deleteStatePost,
  createStatePostValidation 
} from '../controllers/statePost.controller';

const router = Router();

router.post('/', authenticate, createStatePostValidation, createStatePost);
router.get('/', authenticate, getStatePosts);
router.delete('/:id', authenticate, deleteStatePost);

export default router;
