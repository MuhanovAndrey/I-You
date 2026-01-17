# Руководство по развертыванию

## Опция 1: Railway (Рекомендуется)

Railway предоставляет простой способ развертывания как backend, так и frontend.

### Backend на Railway

1. **Создайте аккаунт на Railway**
   - Перейдите на https://railway.app
   - Войдите через GitHub

2. **Создайте PostgreSQL базу данных**
   - Нажмите "New Project"
   - Выберите "Provision PostgreSQL"
   - Скопируйте `DATABASE_URL` из Variables

3. **Разверните Backend**
   - Нажмите "New" → "GitHub Repo"
   - Выберите репозиторий `I-You`
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm start`

4. **Добавьте переменные окружения**
   ```
   DATABASE_URL=<скопированный URL>
   JWT_SECRET=<генерируйте случайную строку>
   JWT_EXPIRES_IN=7d
   TELEGRAM_BOT_TOKEN=<ваш токен бота>
   FRONTEND_URL=<URL frontend после деплоя>
   NODE_ENV=production
   PORT=5000
   ```

5. **Настройте домен**
   - Railway автоматически создаст домен
   - Или добавьте свой кастомный домен

### Frontend на Railway

1. **Создайте новый сервис**
   - В том же проекте нажмите "New"
   - Выберите тот же GitHub репозиторий
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

2. **Добавьте переменные**
   ```
   VITE_API_URL=<URL вашего backend>
   ```

3. **Или используйте статический хостинг**
   - Соберите проект локально: `npm run build`
   - Загрузите `dist/` на любой CDN

## Опция 2: Vercel (Frontend) + Render (Backend)

### Backend на Render

1. **Создайте аккаунт на Render.com**

2. **Создайте PostgreSQL базу**
   - New → PostgreSQL
   - Скопируйте Internal Database URL

3. **Создайте Web Service**
   - New → Web Service
   - Подключите GitHub репозиторий
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm start`

4. **Добавьте переменные окружения**
   (такие же как для Railway)

### Frontend на Vercel

1. **Установите Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Разверните**
   ```bash
   cd frontend
   vercel
   ```

3. **Настройте переменные**
   - В Vercel Dashboard → Settings → Environment Variables
   - Добавьте `VITE_API_URL`

## Опция 3: DigitalOcean App Platform

1. **Создайте App**
   - Apps → Create App
   - Выберите GitHub репозиторий

2. **Настройте компоненты**
   - **Backend**: Node.js service
     - Source Directory: `/backend`
     - Build Command: `npm install && npx prisma generate && npm run build`
     - Run Command: `npx prisma migrate deploy && npm start`
   
   - **Frontend**: Static Site
     - Source Directory: `/frontend`
     - Build Command: `npm install && npm run build`
     - Output Directory: `dist`

3. **Добавьте базу данных**
   - Database → PostgreSQL
   - Подключите к backend

## Опция 4: Docker

### Dockerfile для Backend

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

### Dockerfile для Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: i_you_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/i_you_db
      JWT_SECRET: your-secret-key
      TELEGRAM_BOT_TOKEN: your-bot-token
      FRONTEND_URL: http://localhost:3000
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://localhost:5000

volumes:
  postgres_data:
```

Запуск:
```bash
docker-compose up -d
```

## Настройка Telegram Webhook

После деплоя backend, настройте webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_BACKEND_URL>/api/telegram/webhook"
```

Проверка:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## SSL/HTTPS

### Railway/Render/Vercel
- Автоматически предоставляют SSL сертификаты

### Свой сервер
Используйте Let's Encrypt с Certbot:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Мониторинг

### Railway
- Встроенные метрики и логи
- Alerts можно настроить

### Render
- Встроенная панель мониторинга
- Email уведомления

### Дополнительно
- Sentry для отслеживания ошибок
- LogRocket для session replay
- Datadog/New Relic для APM

## Backup базы данных

### Автоматический backup (Railway)
```bash
railway run pg_dump > backup.sql
```

### Автоматический backup (Render)
- Настраивается автоматически

### Ручной backup
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Восстановление
```bash
psql $DATABASE_URL < backup.sql
```

## Checklist перед деплоем

- [ ] Все переменные окружения настроены
- [ ] DATABASE_URL правильный
- [ ] JWT_SECRET сгенерирован (используйте длинную случайную строку)
- [ ] Telegram бот создан и токен получен
- [ ] Frontend URL указывает на правильный домен
- [ ] CORS настроен на backend для frontend домена
- [ ] SSL сертификаты настроены (HTTPS)
- [ ] Telegram webhook настроен
- [ ] База данных мигрирована
- [ ] Backup стратегия настроена
- [ ] Мониторинг настроен

## Проверка после деплоя

1. **Backend health check**
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **Frontend доступность**
   - Откройте URL в браузере
   - Проверьте регистрацию
   - Проверьте вход

3. **База данных**
   ```bash
   railway run npx prisma studio
   ```

4. **Telegram бот**
   - Отправьте `/start` боту
   - Проверьте получение уведомлений

## Troubleshooting

### Backend не запускается
1. Проверьте логи
2. Убедитесь что DATABASE_URL правильный
3. Проверьте что миграции применены

### Frontend не подключается к Backend
1. Проверьте VITE_API_URL
2. Проверьте CORS на backend
3. Проверьте что backend доступен

### Telegram не работает
1. Проверьте токен бота
2. Проверьте webhook: `/getWebhookInfo`
3. Убедитесь что URL доступен извне

### Ошибки базы данных
1. Проверьте подключение
2. Запустите миграции заново
3. Проверьте логи PostgreSQL

## Обновление приложения

### Railway/Render
- Просто push в GitHub
- Автоматический деплой

### Вручную
```bash
# Backend
cd backend
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart backend

# Frontend
cd frontend
git pull
npm install
npm run build
# Загрузите dist/ на CDN
```

## Масштабирование

### Горизонтальное
- Добавьте больше инстансов backend
- Используйте load balancer
- Database connection pooling

### Вертикальное
- Увеличьте размер сервера
- Больше RAM для базы данных
- Больше CPU для backend

### Кеширование
- Redis для сессий
- CDN для статики
- Database query caching
