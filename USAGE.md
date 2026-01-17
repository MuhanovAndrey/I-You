# I&You - Руководство по использованию

## Быстрый старт с Docker

### Запуск приложения

1. Клонируйте репозиторий:
```bash
git clone https://github.com/MuhanovAndrey/I-You.git
cd I-You
```

2. Запустите все сервисы с помощью Docker Compose:
```bash
docker-compose up --build
```

3. Откройте браузер и перейдите по адресу:
- **Frontend (Веб-интерфейс)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Документация API**: http://localhost:8000/docs

### Первое использование

1. **Регистрация**
   - Откройте http://localhost:5173
   - Нажмите "Зарегистрироваться"
   - Заполните форму (имя пользователя, email, пароль)
   - Нажмите "Зарегистрироваться"

2. **Создание первого поста**
   - После входа нажмите кнопку "✨ Поделиться причиной любви"
   - Введите заголовок и текст
   - Нажмите "Опубликовать"

3. **Взаимодействие с постами**
   - Ставьте реакции на посты (❤️ 😍 👍 😊)
   - Пишите комментарии
   - Просматривайте посты других пользователей

## Ручная установка (без Docker)

### Требования
- Python 3.11+
- PostgreSQL 15+
- Node.js 18+
- npm или yarn

### Backend

1. Установите и запустите PostgreSQL:
```bash
# Создайте базу данных
createdb iandyou
```

2. Установите зависимости Python:
```bash
cd backend
pip install -r requirements.txt
```

3. (Опционально) Настройте переменные окружения:
```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iandyou
export SECRET_KEY=your-super-secret-key-here
```

4. Запустите сервер:
```bash
uvicorn main:app --reload
```

Backend будет доступен на http://localhost:8000

### Frontend

1. Установите зависимости:
```bash
cd frontend
npm install
```

2. Запустите dev сервер:
```bash
npm run dev
```

Frontend будет доступен на http://localhost:5173

## Особенности

### Анимированный фон
Приложение использует Canvas API для создания красивой анимации:
- Падающие лепестки сакуры (розовые)
- Падающие сердечки (розовые)
- Плавные движения с эффектом качания
- Полупрозрачность для создания глубины

### Безопасность
- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- CORS настроен для безопасных запросов
- Защита от SQL-инъекций через SQLAlchemy ORM

### API

#### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получить информацию о текущем пользователе

#### Посты
- `GET /api/posts/` - Получить все посты (сортировка по дате)
- `POST /api/posts/` - Создать новый пост (требуется авторизация)
- `GET /api/posts/{id}` - Получить конкретный пост
- `DELETE /api/posts/{id}` - Удалить пост (только автор)

#### Реакции
- `POST /api/reactions/` - Добавить/обновить реакцию
- `DELETE /api/reactions/{post_id}` - Удалить реакцию
- `GET /api/reactions/{post_id}` - Получить все реакции поста

Типы реакций: `heart`, `like`, `love`, `smile`, `sad`

#### Комментарии
- `GET /api/comments/{post_id}` - Получить комментарии к посту
- `POST /api/comments/` - Добавить комментарий
- `DELETE /api/comments/{id}` - Удалить комментарий (только автор)

## Разработка

### Структура проекта

```
I-You/
├── backend/              # FastAPI бэкенд
│   ├── main.py          # Главный файл приложения
│   ├── models.py        # SQLAlchemy модели
│   ├── schemas.py       # Pydantic схемы
│   ├── auth.py          # Аутентификация и авторизация
│   ├── database.py      # Настройка БД
│   └── routers/         # API маршруты
│       ├── auth.py
│       ├── posts.py
│       ├── reactions.py
│       └── comments.py
├── frontend/            # React фронтенд
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   │   ├── AnimatedBackground.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Post.jsx
│   │   │   └── CreatePost.jsx
│   │   ├── services/    # API сервисы
│   │   │   └── api.js
│   │   └── App.jsx      # Главный компонент
│   └── package.json
└── docker-compose.yml   # Docker конфигурация
```

### Добавление новых функций

#### Новый API endpoint (Backend)
1. Создайте новую функцию в соответствующем роутере (`routers/`)
2. Добавьте необходимые схемы в `schemas.py`
3. При необходимости обновите модели в `models.py`

#### Новый компонент (Frontend)
1. Создайте компонент в `frontend/src/components/`
2. Импортируйте и используйте в родительском компоненте
3. Добавьте стили в соответствующий CSS файл

## Производственное развертывание

### Переменные окружения (Production)

Создайте `.env` файл:
```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-very-secure-secret-key-min-32-chars
```

### Build для production

**Frontend:**
```bash
cd frontend
npm run build
```

Собранные файлы будут в `frontend/dist/`

**Backend:**
Используйте Gunicorn для production:
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## Устранение неполадок

### Backend не запускается
- Проверьте, что PostgreSQL запущен
- Убедитесь, что DATABASE_URL корректен
- Проверьте, что все зависимости установлены

### Frontend не подключается к API
- Убедитесь, что backend запущен на порту 8000
- Проверьте настройки CORS в `backend/main.py`
- Проверьте `API_URL` в `frontend/src/services/api.js`

### База данных не создается
- Проверьте права доступа к PostgreSQL
- Убедитесь, что пользователь БД имеет права на создание таблиц
- Проверьте логи при запуске приложения

## Лицензия

MIT License - используйте свободно!

## Поддержка

Если у вас возникли вопросы или проблемы, создайте issue в репозитории GitHub.
