import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN || '';

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token, { polling: false });
  console.log('✅ Telegram Bot initialized');
} else {
  console.warn('⚠️  Telegram Bot token not configured');
}

export default bot;
