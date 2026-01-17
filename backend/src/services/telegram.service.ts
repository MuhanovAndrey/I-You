import bot from '../config/telegram';
import prisma from '../config/database';

export enum NotificationType {
  LOVE_REASON = 'love_reason',
  GIFT_IDEA = 'gift_idea',
  STATE_POST = 'state_post',
  REACTION = 'reaction',
  COMMENT = 'comment',
  PAIRING_REQUEST = 'pairing_request',
  PAIRING_ACCEPTED = 'pairing_accepted'
}

interface NotificationData {
  type: NotificationType;
  fromUserId: string;
  toUserId: string;
  content?: string;
  actionUrl?: string;
}

class TelegramService {
  async sendNotification(data: NotificationData): Promise<void> {
    try {
      if (!bot) {
        console.warn('Telegram bot not configured');
        return;
      }

      const toUser = await prisma.user.findUnique({
        where: { id: data.toUserId },
        select: { telegramChatId: true, telegramVerified: true, username: true }
      });

      if (!toUser || !toUser.telegramChatId || !toUser.telegramVerified) {
        console.log(`User ${data.toUserId} has no verified Telegram chat`);
        return;
      }

      const fromUser = await prisma.user.findUnique({
        where: { id: data.fromUserId },
        select: { username: true }
      });

      const message = this.formatMessage(data, fromUser?.username || 'Unknown');
      
      await bot.sendMessage(toUser.telegramChatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });

      console.log(`✅ Notification sent to user ${toUser.username}`);
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  private formatMessage(data: NotificationData, fromUsername: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = data.actionUrl || baseUrl;

    const messages: Record<NotificationType, string> = {
      [NotificationType.LOVE_REASON]: `❤️ <b>${fromUsername}</b> добавил(а) новую причину, почему любит тебя!\n\n"${data.content}"\n\n<a href="${url}">Посмотреть на сайте</a>`,
      [NotificationType.GIFT_IDEA]: `🎁 <b>${fromUsername}</b> хочет подарить тебе что-то!\n\n"${data.content}"\n\n<a href="${url}">Посмотреть на сайте</a>`,
      [NotificationType.STATE_POST]: `💭 <b>${fromUsername}</b> поделился(ась) своим состоянием\n\n"${data.content}"\n\n<a href="${url}">Посмотреть на сайте</a>`,
      [NotificationType.REACTION]: `👍 <b>${fromUsername}</b> отреагировал(а) на твой пост!\n\n<a href="${url}">Посмотреть на сайте</a>`,
      [NotificationType.COMMENT]: `💬 <b>${fromUsername}</b> оставил(а) комментарий\n\n"${data.content}"\n\n<a href="${url}">Посмотреть на сайте</a>`,
      [NotificationType.PAIRING_REQUEST]: `💑 <b>${fromUsername}</b> хочет связать свой аккаунт с тобой!\n\n<a href="${url}">Ответить на запрос</a>`,
      [NotificationType.PAIRING_ACCEPTED]: `💕 <b>${fromUsername}</b> принял(а) твой запрос на связь!\n\nТеперь вы пара! ❤️\n\n<a href="${url}">Перейти на сайт</a>`
    };

    return messages[data.type] || `🔔 Новое уведомление от <b>${fromUsername}</b>`;
  }

  async verifyTelegramUser(userId: string, telegramUsername: string): Promise<{ verified: boolean; chatId?: string }> {
    try {
      if (!bot) {
        return { verified: false };
      }

      // In production, you would implement a verification flow
      // For now, we'll just mark as verified when they provide username
      // The actual verification would happen through a bot command
      
      return { verified: true };
    } catch (error) {
      console.error('Error verifying Telegram user:', error);
      return { verified: false };
    }
  }

  async handleWebhook(update: any): Promise<void> {
    try {
      if (!update.message) return;

      const chatId = update.message.chat.id;
      const text = update.message.text;
      const telegramUsername = update.message.from.username;

      if (text === '/start') {
        const user = await prisma.user.findFirst({
          where: { 
            telegramUsername: telegramUsername,
            telegramVerified: false
          }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              telegramChatId: chatId.toString(),
              telegramVerified: true
            }
          });

          await bot!.sendMessage(chatId, 
            `✅ Привет, ${user.username}! Твой аккаунт успешно связан с Telegram.\n\nТеперь ты будешь получать уведомления о всех активностях!`,
            { parse_mode: 'HTML' }
          );
        } else {
          await bot!.sendMessage(chatId,
            `👋 Привет! Чтобы связать аккаунт с сайтом "ЯиТЫ", сначала зарегистрируйся на сайте и укажи свой Telegram username: @${telegramUsername}`,
            { parse_mode: 'HTML' }
          );
        }
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
    }
  }
}

export default new TelegramService();
