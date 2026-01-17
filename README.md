# ЯиТЫ (I-You) - Приложение для любви 💕

Веб-приложение для пар, где можно делиться причинами любви, идеями подарков, своим состоянием и получать уведомления в Telegram.

## 🌟 Функции

- **Аутентификация**: Регистрация и вход с JWT
- **Система пар**: Связывание аккаунтов двух пользователей
- **Причины любви**: Делитесь тем, за что вы любите друг друга ❤️
- **Идеи подарков**: Создавайте список того, что хотите подарить 🎁
- **Состояния**: Описывайте своё физическое или эмоциональное состояние 💭
- **Реакции**: Ставьте эмодзи-реакции на посты
- **Комментарии**: Обсуждайте посты друг с другом
- **Telegram интеграция**: Получайте уведомления о всех действиях
- **Красивый дизайн**: Анимированный фон с лепестками сакуры и сердечками 🌸💕

## 🏗️ Технологии

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Telegram Bot API
- bcrypt для хеширования паролей

### Frontend
- React 18 + TypeScript
- Vite
- React Router
- Zustand (state management)
- Tailwind CSS
- Axios
- React Hot Toast

## 📦 Установка

### Требования
- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn

### 1. Клонирование репозитория
```bash
git clone https://github.com/MuhanovAndrey/I-You.git
cd I-You
```

### 2. Установка зависимостей

Установка всех зависимостей (root, backend, frontend):
```bash
npm run install:all
```

Или по отдельности:
```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 3. Настройка базы данных

Создайте PostgreSQL базу данных:
```bash
createdb i_you_db
```

### 4. Настройка переменных окружения

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
```

Отредактируйте `backend/.env`:
```env
NODE_ENV=development
PORT=5000

# Замените на данные вашей БД
DATABASE_URL="postgresql://user:password@localhost:5432/i_you_db?schema=public"

# Сгенерируйте безопасный секрет
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Создайте бота через @BotFather в Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

FRONTEND_URL=http://localhost:3000
```

### 5. Миграция базы данных

```bash
cd backend
npx prisma migrate dev --name init
```

### 6. Запуск приложения

**Режим разработки (одновременно backend + frontend):**
```bash
npm run dev
```

**Или раздельно:**
```bash
# Backend (терминал 1)
npm run dev:backend

# Frontend (терминал 2)
npm run dev:frontend
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🤖 Настройка Telegram бота

### 1. Создание бота
1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям и получите токен
4. Добавьте токен в `backend/.env` как `TELEGRAM_BOT_TOKEN`

### 2. Настройка webhook (для продакшена)
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DOMAIN>/api/telegram/webhook"
```

### 3. Проверка бота
1. Зарегистрируйтесь на сайте с Telegram username
2. Найдите своего бота в Telegram
3. Отправьте `/start`
4. Бот подтвердит связь аккаунта

## 📝 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/verify` - Проверка токена

### Пользователи
- `GET /api/users/me` - Текущий пользователь
- `GET /api/users/search` - Поиск пользователей

### Связывание
- `POST /api/pairing/request` - Отправить запрос
- `GET /api/pairing/requests` - Список запросов
- `POST /api/pairing/respond/:id` - Ответить на запрос
- `POST /api/pairing/unpair` - Разорвать связь

### Контент
- `POST /api/love-reasons` - Создать причину любви
- `GET /api/love-reasons` - Получить все
- `DELETE /api/love-reasons/:id` - Удалить

- `POST /api/gift-ideas` - Создать идею подарка
- `GET /api/gift-ideas` - Получить все
- `DELETE /api/gift-ideas/:id` - Удалить

- `POST /api/state-posts` - Создать пост о состоянии
- `GET /api/state-posts` - Получить все
- `DELETE /api/state-posts/:id` - Удалить

### Взаимодействия
- `POST /api/reactions` - Добавить реакцию
- `DELETE /api/reactions/:id` - Удалить реакцию

- `POST /api/comments` - Добавить комментарий
- `DELETE /api/comments/:id` - Удалить комментарий

## 🚀 Деплой

### База данных
Создайте PostgreSQL базу на любом хостинге (Railway, Supabase, Heroku и т.д.)

### Backend
Можно задеплоить на:
- Railway
- Render
- Heroku
- DigitalOcean

Убедитесь, что установили переменные окружения.

### Frontend
Можно задеплоить на:
- Vercel
- Netlify
- Railway

Настройте переменную `VITE_API_URL` для продакшена.

### Настройка Telegram webhook
После деплоя backend, настройте webhook:
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-backend-domain.com/api/telegram/webhook"
```

## 📱 Использование

1. **Регистрация**: Создайте аккаунт, укажите Telegram username (опционально)
2. **Связывание**: Найдите партнёра и отправьте запрос на связывание
3. **Telegram**: Отправьте `/start` боту для подтверждения
4. **Создание постов**: Делитесь причинами любви, идеями подарков и состояниями
5. **Взаимодействие**: Реагируйте и комментируйте посты партнёра
6. **Уведомления**: Получайте уведомления в Telegram о всех действиях

## 🔒 Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- CORS настроен для безопасности
- Helmet.js для защиты заголовков
- Валидация всех входных данных

## 📄 Лицензия

MIT

## 👨‍💻 Автор

Andrey Muhanov

## 🙏 Благодарности

Создано с любовью для всех влюблённых пар! ❤️
