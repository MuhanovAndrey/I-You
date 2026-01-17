import { Router, Request, Response } from 'express';
import telegramService from '../services/telegram.service';
import bot from '../config/telegram';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

let cachedBotUsername: string | null = null;

router.get('/bot', async (_req: Request, res: Response) => {
  try {
    if (cachedBotUsername) return res.json({ botUsername: cachedBotUsername });

    const fromEnv = (process.env.TELEGRAM_BOT_USERNAME || '').trim();
    if (fromEnv) {
      cachedBotUsername = fromEnv.replace(/^@/, '');
      return res.json({ botUsername: cachedBotUsername });
    }

    if (!bot) return res.json({ botUsername: null });

    const me = await bot.getMe();
    cachedBotUsername = (me.username || '').trim() || null;
    return res.json({ botUsername: cachedBotUsername });
  } catch (error) {
    console.error('Telegram bot username error:', error);
    return res.json({ botUsername: null });
  }
});

router.get('/status', (_req: Request, res: Response) => {
  res.json({
    botConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    polling: (process.env.TELEGRAM_POLLING || '').toLowerCase() === 'true',
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || null
  });
});

router.post('/test', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!bot) {
      return res.status(500).json({ error: 'Telegram бот не настроен' });
    }

    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true, telegramVerified: true, username: true }
    });

    if (!user || !user.telegramVerified || !user.telegramChatId) {
      return res.status(400).json({ error: 'Telegram не подключен. Откройте бота и нажмите Start.' });
    }

    await bot.sendMessage(
      user.telegramChatId,
      `✅ Telegram подключен!\n\nПривет, ${user.username}! Теперь уведомления будут приходить сюда.`
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Telegram test error:', error);
    res.status(500).json({ error: 'Не удалось отправить тестовое сообщение' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    await telegramService.handleWebhook(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.sendStatus(500);
  }
});

export default router;
