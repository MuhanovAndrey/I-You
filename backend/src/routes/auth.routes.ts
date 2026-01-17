import { Router } from 'express';
import { register, login, verifyToken, registerValidation, loginValidation } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/verify', verifyToken);

export default router;
