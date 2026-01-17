import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  createComment, 
  deleteComment,
  createCommentValidation 
} from '../controllers/comment.controller';

const router = Router();

router.post('/', authenticate, createCommentValidation, createComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
