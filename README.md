# I&You - Платформа для выражения любви 💕

## Описание

I&You - это социальная платформа, где пользователи могут делиться причинами своей любви, ставить реакции и оставлять комментарии.

### Основные возможности

- 🔐 Регистрация и авторизация пользователей
- 💝 Создание постов с причинами любви
- ❤️ Реакции на посты (сердце, лайк, улыбка и др.)
- 💬 Комментарии к постам
- 🌸 Анимированный фон с лепестками сакуры и сердечками
- ⏰ Отображение даты и времени постов

### Технологии

**Backend:**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy
- JWT авторизация

**Frontend:**
- React
- Vite
- Axios
- Canvas анимация

## Установка и запуск

### С помощью Docker (рекомендуется)

1. Убедитесь, что у вас установлены Docker и Docker Compose

2. Клонируйте репозиторий:
```bash
git clone https://github.com/MuhanovAndrey/I-You.git
cd I-You
```

3. Запустите приложение:
```bash
docker-compose up --build
```

4. Откройте в браузере:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API документация: http://localhost:8000/docs

### Ручная установка

#### Backend

1. Установите PostgreSQL и создайте базу данных:
```bash
createdb iandyou
```

2. Установите зависимости:
```bash
cd backend
pip install -r requirements.txt
```

3. Настройте переменную окружения (опционально):
```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iandyou
```

4. Запустите сервер:
```bash
uvicorn main:app --reload
```

#### Frontend

1. Установите зависимости:
```bash
cd frontend
npm install
```

2. Запустите dev сервер:
```bash
npm run dev
```

## Использование

1. Зарегистрируйтесь или войдите в систему
2. Создайте пост с причиной, за что вы любите кого-то
3. Просматривайте посты других пользователей
4. Ставьте реакции и оставляйте комментарии
5. Наслаждайтесь красивым анимированным фоном!

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя

### Посты
- `GET /api/posts/` - Получить все посты
- `POST /api/posts/` - Создать пост
- `GET /api/posts/{id}` - Получить пост по ID
- `DELETE /api/posts/{id}` - Удалить пост

### Реакции
- `POST /api/reactions/` - Добавить реакцию
- `DELETE /api/reactions/{post_id}` - Удалить реакцию
- `GET /api/reactions/{post_id}` - Получить реакции поста

### Комментарии
- `GET /api/comments/{post_id}` - Получить комментарии поста
- `POST /api/comments/` - Создать комментарий
- `DELETE /api/comments/{id}` - Удалить комментарий

## Лицензия

MIT
