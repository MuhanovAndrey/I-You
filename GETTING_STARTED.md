# Руководство по началу работы

## Быстрый старт

### 1. Установка и запуск (5 минут)

```bash
# Клонируйте репозиторий
git clone https://github.com/MuhanovAndrey/I-You.git
cd I-You

# Установите зависимости
npm run install:all

# Настройте базу данных
createdb i_you_db

# Скопируйте и настройте .env
cp backend/.env.example backend/.env
# Отредактируйте backend/.env (см. ниже)

# Запустите миграции
cd backend && npx prisma migrate dev --name init && cd ..

# Запустите приложение
npm run dev
```

#### Windows (PowerShell) заметки

Команды выше написаны в стиле macOS/Linux. На Windows используйте эквиваленты:

```powershell
# Скопировать .env
Copy-Item backend\.env.example backend\.env
```

Создать БД можно любым удобным способом:

- Через pgAdmin (Create → Database)
- Или через psql:

```powershell
psql -U postgres -c "CREATE DATABASE i_you_db;"
```

Откройте http://localhost:3000

### 2. Минимальная конфигурация .env

```env
DATABASE_URL="postgresql://localhost:5432/i_you_db?schema=public"
JWT_SECRET=any-random-secret-string-here
TELEGRAM_BOT_TOKEN=optional-for-testing
```

Приложение будет работать и без Telegram бота, но уведомления не будут отправляться.

## Первые шаги

### Регистрация первого пользователя

1. Откройте http://localhost:3000
2. Нажмите "Зарегистрироваться"
3. Заполните форму:
   - Email: `user1@example.com`
   - Имя пользователя: `user1`
   - Пароль: `password123`
   - Telegram (опционально): `@user1`

### Регистрация второго пользователя

Откройте в режиме инкогнито или другом браузере:
1. Зарегистрируйте второго пользователя
2. Email: `user2@example.com`
3. Имя: `user2`

### Связывание пары

1. В аккаунте `user1`:
   - Введите в поиск: `user2`
   - Нажмите "Отправить запрос"

2. В аккаунте `user2`:
   - Увидите входящий запрос от `user1`
   - Нажмите "Принять"

3. Оба пользователя перенаправятся на Dashboard

### Создание первого поста

1. На Dashboard нажмите "Причина любви"
2. Напишите что-нибудь милое
3. Нажмите "Создать пост"
4. Пост появится в ленте обоих пользователей

### Реакции и комментарии

1. Нажмите на эмодзи под постом для реакции
2. Нажмите "💬 Комментарии"
3. Напишите комментарий

## Настройка Telegram бота (опционально)

### Создание бота

1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте: `/newbot`
3. Имя бота: `I-You Love Bot`
4. Username: `your_unique_name_bot`
5. Скопируйте токен

### Добавление токена

В `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

Перезапустите backend.

### Связывание с аккаунтом

1. При регистрации укажите свой Telegram: `@yourusername`
2. Найдите бота в Telegram
3. Отправьте: `/start`
4. Бот ответит подтверждением

Теперь вы будете получать уведомления!

## Структура проекта

```
I-You/
├── backend/           # API сервер
│   ├── prisma/       # Схема БД
│   ├── src/          # Исходный код
│   └── .env          # Конфигурация
├── frontend/         # React приложение
│   └── src/          # Компоненты
├── README.md         # Основная документация
├── ARCHITECTURE.md   # Архитектура
└── package.json      # Root скрипты
```

## Полезные команды

### Разработка
```bash
npm run dev              # Запуск всего (backend + frontend)
npm run dev:backend      # Только backend
npm run dev:frontend     # Только frontend
```

### База данных
```bash
cd backend
npx prisma studio        # GUI для БД
npx prisma migrate dev   # Создать миграцию
npx prisma db push       # Быстрое обновление схемы
```

### Сборка
```bash
npm run build            # Сборка всего
npm run build:backend    # Только backend
npm run build:frontend   # Только frontend
```

## Решение проблем

### Ошибка подключения к БД
```bash
# Проверьте, запущен ли PostgreSQL
sudo service postgresql status

# Создайте БД если её нет
createdb i_you_db

# Проверьте DATABASE_URL в .env
```

### Ошибка порта занят
```bash
# Backend (порт 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (порт 3000)
lsof -ti:3000 | xargs kill -9
```

**Windows (PowerShell):**

```powershell
# Найти PID по порту
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Убить процесс (подставьте нужный PID)
taskkill /PID 12345 /F
```

### Ошибки TypeScript
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm run install:all
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm run install:all
```

### Telegram бот не отвечает
1. Проверьте токен в `.env`
2. Убедитесь что backend запущен
3. Проверьте что username в профиле совпадает с Telegram

## Дальнейшее чтение

- [README.md](README.md) - Полная документация
- [ARCHITECTURE.md](ARCHITECTURE.md) - Архитектура системы
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) - План развития

## Поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Изучите документацию выше
3. Создайте Issue на GitHub

Удачи! ❤️
