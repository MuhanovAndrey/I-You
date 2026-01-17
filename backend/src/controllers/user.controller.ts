import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

const normalizeTelegramUsername = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withoutAt = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  return withoutAt.trim() || null;
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Ошибка получения пользователя' });
  }
};

export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : null;
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : null;
    const telegramUsername = normalizeTelegramUsername(req.body.telegramUsername);

    if (!email) {
      return res.status(400).json({ error: 'Укажите email' });
    }

    const emailLower = email.toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({ error: 'Некорректный email' });
    }

    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Имя пользователя должно быть минимум 3 символа' });
    }

    if (!telegramUsername) {
      return res.status(400).json({ error: 'Укажите имя пользователя Telegram' });
    }

    const existing = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              { email: emailLower },
              { username },
              { telegramUsername }
            ]
          }
        ]
      },
      select: { email: true, username: true, telegramUsername: true }
    });

    if (existing) {
      if (existing.email === emailLower) return res.status(400).json({ error: 'Этот email уже зарегистрирован' });
      if (existing.username === username) return res.status(400).json({ error: 'Имя пользователя уже занято' });
      if (existing.telegramUsername?.toLowerCase() === telegramUsername.toLowerCase()) {
        return res.status(400).json({ error: 'Это имя пользователя Telegram уже зарегистрировано' });
      }
      return res.status(400).json({ error: 'Такие данные уже используются' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email: emailLower,
        username,
        telegramUsername
      },
      select: {
        id: true,
        email: true,
        username: true,
        telegramUsername: true,
        telegramVerified: true,
        pairedWithId: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update current user error:', error);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    const userId = req.userId!;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Нужно указать параметр поиска' });
    }

    const normalizedQuery = query.trim().startsWith('@')
      ? query.trim().slice(1)
      : query.trim();

    if (!normalizedQuery) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            telegramUsername: { contains: normalizedQuery, mode: 'insensitive' }
          },
          { telegramUsername: { not: null } },
          { id: { not: userId } },
          { pairedWithId: null }
        ]
      },
      select: {
        id: true,
        username: true,
        telegramUsername: true,
        createdAt: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Ошибка поиска пользователей' });
  }
};
