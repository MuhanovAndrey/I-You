# Архитектура проекта "ЯиТЫ"

## Структура проекта

```
I-You/
├── backend/                    # Backend API (Node.js + Express)
│   ├── prisma/
│   │   └── schema.prisma      # Схема базы данных
│   ├── src/
│   │   ├── config/            # Конфигурация
│   │   │   ├── database.ts    # Prisma клиент
│   │   │   └── telegram.ts    # Telegram бот
│   │   ├── controllers/       # Контроллеры API
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── pairing.controller.ts
│   │   │   ├── loveReason.controller.ts
│   │   │   ├── giftIdea.controller.ts
│   │   │   ├── statePost.controller.ts
│   │   │   ├── reaction.controller.ts
│   │   │   └── comment.controller.ts
│   │   ├── middleware/        # Middleware
│   │   │   └── auth.middleware.ts
│   │   ├── routes/            # Маршруты API
│   │   ├── services/          # Бизнес-логика
│   │   │   └── telegram.service.ts
│   │   └── server.ts          # Точка входа
│   └── package.json
├── frontend/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   │   ├── AnimatedBackground.tsx
│   │   │   ├── PostCard.tsx
│   │   │   └── CreatePostModal.tsx
│   │   ├── pages/             # Страницы
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Pairing.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── services/          # API клиент
│   │   │   └── api.ts
│   │   ├── store/             # State management
│   │   │   └── authStore.ts
│   │   ├── types/             # TypeScript типы
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
└── package.json               # Root package.json

```

## Модели данных

### User (Пользователь)
- id, email, username, password
- telegramUsername, telegramChatId, telegramVerified
- pairedWithId (связь с партнёром)

### PairingRequest (Запрос на связывание)
- fromUserId, toUserId
- status: pending/accepted/rejected

### LoveReason (Причина любви)
- userId, content
- reactions[], comments[]

### GiftIdea (Идея подарка)
- userId, title, description
- reactions[], comments[]

### StatePost (Пост о состоянии)
- userId, type (physical/emotional), content
- reactions[], comments[]

### Reaction (Реакция)
- userId, type (emoji)
- Полиморфная связь с loveReason/giftIdea/statePost/comment

### Comment (Комментарий)
- userId, content
- Полиморфная связь с loveReason/giftIdea/statePost
- reactions[]

## Потоки данных

### 1. Регистрация и аутентификация
1. Пользователь регистрируется (email, username, password, telegram)
2. Backend создаёт пользователя, хеширует пароль
3. Возвращает JWT токен
4. Frontend сохраняет токен в localStorage
5. Все последующие запросы включают токен в заголовке

### 2. Связывание пары
1. Пользователь A ищет пользователя B
2. Отправляет запрос на связывание
3. Пользователь B получает уведомление в Telegram
4. B принимает запрос
5. Обоим пользователям устанавливается pairedWithId
6. Отправляется уведомление A об успехе

### 3. Создание контента
1. Пользователь создаёт пост (любовь/подарок/состояние)
2. Backend сохраняет в БД
3. Отправляет уведомление партнёру в Telegram
4. Frontend обновляет список постов

### 4. Реакции и комментарии
1. Пользователь ставит реакцию/пишет комментарий
2. Backend сохраняет
3. Отправляет уведомление автору поста
4. Frontend обновляет пост

## Уведомления Telegram

### Типы уведомлений
1. **LOVE_REASON**: Новая причина любви
2. **GIFT_IDEA**: Новая идея подарка
3. **STATE_POST**: Новое состояние
4. **REACTION**: Новая реакция на пост
5. **COMMENT**: Новый комментарий
6. **PAIRING_REQUEST**: Запрос на связывание
7. **PAIRING_ACCEPTED**: Запрос принят

### Процесс верификации Telegram
1. Пользователь указывает Telegram username при регистрации
2. Ищет бота в Telegram
3. Отправляет `/start`
4. Бот находит пользователя по username
5. Сохраняет chatId и устанавливает telegramVerified=true
6. Теперь пользователь получает уведомления

## Безопасность

### Аутентификация
- JWT токены с истечением
- Bcrypt для хеширования паролей (10 раундов)
- Проверка авторизации на всех защищённых эндпоинтах

### Авторизация
- Пользователи могут видеть только свои посты и посты партнёра
- Удалять могут только свои посты
- Реагировать и комментировать могут оба партнёра

### Защита API
- Helmet.js для HTTP заголовков
- CORS настроен на frontend домен
- Валидация входных данных (express-validator)
- Защита от SQL инъекций (Prisma ORM)

## Масштабируемость

### База данных
- Индексы на часто запрашиваемых полях
- Эффективные запросы с include для связанных данных
- Пагинация для больших списков

### API
- Stateless сервер (можно горизонтально масштабировать)
- Кеширование на уровне БД
- Сжатие ответов (compression middleware)

### Frontend
- Lazy loading компонентов
- Оптимизация изображений
- Code splitting с Vite

## Будущие улучшения

1. **Real-time обновления**: WebSocket для мгновенных обновлений
2. **Загрузка файлов**: Фото и видео в постах
3. **Календарь**: Важные даты и напоминания
4. **Статистика**: Графики активности пары
5. **Темы оформления**: Различные цветовые схемы
6. **Локализация**: Поддержка разных языков
7. **Мобильное приложение**: React Native версия
8. **Приватность**: Шифрование сообщений
9. **Backup**: Экспорт данных пары
10. **Gamification**: Достижения и награды
