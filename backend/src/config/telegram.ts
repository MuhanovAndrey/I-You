import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN || '';
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || '';
const pollingEnabled = (process.env.TELEGRAM_POLLING || '').toLowerCase() === 'true';

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token, { polling: pollingEnabled });
  console.log(`✅ Telegram Bot initialized (${pollingEnabled ? 'polling' : 'webhook'})`);

  if (pollingEnabled) {
    // If a webhook was previously set for this bot, Telegram will block getUpdates with a 409 conflict.
    // Clearing webhook makes polling work reliably in dev.
    bot.deleteWebHook()
      .then(() => console.log('✅ Telegram webhook cleared (polling mode)'))
      .catch((err) => console.error('❌ Failed to clear Telegram webhook:', err));
  } else {
    if (!webhookUrl) {
      console.warn('⚠️  TELEGRAM_WEBHOOK_URL не настроен (webhook-режим). Telegram /start не будет доходить до сервера.');
    } else if (/^https?:\/\/t\.me\//i.test(webhookUrl) || /^https?:\/\/(www\.)?t\.me\//i.test(webhookUrl)) {
      console.warn('⚠️  TELEGRAM_WEBHOOK_URL указан неправильно (это ссылка на бота). Нужно указать публичный URL backend: https://<domain>/api/telegram/webhook');
    } else {
      bot.setWebHook(webhookUrl)
        .then(() => console.log(`✅ Telegram webhook set: ${webhookUrl}`))
        .catch((err) => console.error('❌ Failed to set Telegram webhook:', err));
    }
  }
} else {
  console.warn('⚠️  Telegram Bot token not configured');
}

export default bot;
