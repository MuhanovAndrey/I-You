import { Router, Request, Response } from 'express';
import telegramService from '../services/telegram.service';

const router = Router();

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
