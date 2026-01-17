import { Router } from 'express';
import {
	register,
	login,
	verifyToken,
	completeRegistration,
	cancelRegistration,
	registerValidation,
	loginValidation,
	completeRegistrationValidation,
	cancelRegistrationValidation
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/complete-registration', completeRegistrationValidation, completeRegistration);
router.post('/cancel-registration', cancelRegistrationValidation, cancelRegistration);
router.get('/verify', verifyToken);

export default router;
