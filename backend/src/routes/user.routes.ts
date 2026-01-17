import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getCurrentUser, searchUsers } from '../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, getCurrentUser);
router.get('/search', authenticate, searchUsers);

export default router;
