import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  createLoveReason, 
  getLoveReasons, 
  deleteLoveReason,
  createLoveReasonValidation 
} from '../controllers/loveReason.controller';

const router = Router();

router.post('/', authenticate, createLoveReasonValidation, createLoveReason);
router.get('/', authenticate, getLoveReasons);
router.delete('/:id', authenticate, deleteLoveReason);

export default router;
