import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { body, validationResult } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('username').isLength({ min: 3 }).withMessage('Имя пользователя должно быть минимум 3 символа'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
  body('telegramUsername')
    .notEmpty().withMessage('Укажите имя пользователя Telegram')
    .isString().withMessage('Некорректное имя пользователя Telegram')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Введите пароль')
];

export const completeRegistrationValidation = [
  body('registrationToken').notEmpty().withMessage('registrationToken не передан')
];

export const cancelRegistrationValidation = [
  body('registrationToken').notEmpty().withMessage('registrationToken не передан')
];

const normalizeTelegramUsername = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withoutAt = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  return withoutAt.trim() || null;
};

const jwtSecret = (): jwt.Secret => process.env.JWT_SECRET ?? 'default-secret';
const jwtExpiresIn = (): jwt.SignOptions['expiresIn'] => (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'];

const signAuthToken = (userId: string): string => {
  return jwt.sign({ userId }, jwtSecret(), { expiresIn: jwtExpiresIn() });
};

const signRegistrationToken = (userId: string): string => {
  // Short-lived token used only to finish registration after Telegram verification.
  return jwt.sign(
    { purpose: 'complete_registration', userId },
    jwtSecret(),
    { expiresIn: '30m' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0]?.msg ?? 'Некорректные данные' });
    }

    const { email, username, password } = req.body;
    const telegramUsername = normalizeTelegramUsername(req.body.telegramUsername);
    if (!telegramUsername) {
      return res.status(400).json({ error: 'Укажите имя пользователя Telegram' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? 'Этот email уже зарегистрирован' 
          : 'Имя пользователя уже занято' 
      });
    }

    // Check telegram username uniqueness
    const telegramUser = await prisma.user.findUnique({
      where: { telegramUsername }
    });

    if (telegramUser) {
      return res.status(400).json({ error: 'Это имя пользователя Telegram уже зарегистрировано' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Short code for Telegram deep-link verification: t.me/<bot>?start=<code>
    // Must fit Telegram payload limits (<= 64 chars). 16 random bytes => ~22 chars base64url.
    const telegramVerifyCode = crypto.randomBytes(16).toString('base64url');
    const telegramVerifyExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        telegramUsername,
        telegramVerifyCode,
        telegramVerifyExpiresAt
      } as any,
      select: {
        id: true,
        email: true,
        username: true,
        telegramUsername: true,
        telegramVerified: true,
        pairedWithId: true,
        pairedWith: {
          select: {
            id: true,
            username: true,
            telegramUsername: true
          }
        },
        createdAt: true
      }
    });

    // Registration is completed only after Telegram is verified via bot /start.
    const registrationToken = signRegistrationToken(user.id);
    res.status(201).json({
      requiresTelegramVerification: true,
      registrationToken,
      telegramStartCode: telegramVerifyCode,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка создания пользователя' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0]?.msg ?? 'Некорректные данные' });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        telegramUsername: true,
        telegramVerified: true,
        pairedWithId: true,
        pairedWith: {
          select: {
            id: true,
            username: true,
            telegramUsername: true
          }
        },
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (!user.telegramVerified) {
      return res.status(403).json({
        error: 'Подтвердите Telegram: откройте бота и нажмите /start, затем попробуйте снова.'
      });
    }

    const token = signAuthToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
};

export const completeRegistration = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0]?.msg ?? 'Некорректные данные' });
    }

    const registrationToken = String(req.body.registrationToken || '');
    const decoded = jwt.verify(registrationToken, jwtSecret()) as { purpose?: string; userId?: string };

    if (decoded?.purpose !== 'complete_registration' || !decoded?.userId) {
      return res.status(401).json({ error: 'Недействительный registrationToken' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        telegramUsername: true,
        telegramVerified: true,
        pairedWithId: true,
        pairedWith: {
          select: {
            id: true,
            username: true,
            telegramUsername: true
          }
        },
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!user.telegramVerified) {
      return res.status(409).json({ error: 'Telegram еще не подтвержден. Нажмите /start в боте.' });
    }

    const token = signAuthToken(user.id);
    return res.json({ user, token });
  } catch (error) {
    console.error('Complete registration error:', error);
    return res.status(401).json({ error: 'Не удалось завершить регистрацию' });
  }
};

export const cancelRegistration = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0]?.msg ?? 'Некорректные данные' });
    }

    const registrationToken = String(req.body.registrationToken || '');
    const decoded = jwt.verify(registrationToken, jwtSecret()) as { purpose?: string; userId?: string };

    if (decoded?.purpose !== 'complete_registration' || !decoded?.userId) {
      return res.status(401).json({ error: 'Недействительный registrationToken' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, telegramVerified: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.telegramVerified) {
      return res.status(409).json({ error: 'Нельзя отменить регистрацию: Telegram уже подтвержден.' });
    }

    await prisma.user.delete({ where: { id: user.id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Cancel registration error:', error);
    return res.status(401).json({ error: 'Не удалось отменить регистрацию' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Токен не передан' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, jwtSecret()) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        telegramUsername: true,
        telegramVerified: true,
        pairedWithId: true,
        pairedWith: {
          select: {
            id: true,
            username: true,
            telegramUsername: true
          }
        },
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Недействительный токен' });
  }
};
