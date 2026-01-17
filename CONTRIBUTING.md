# Вклад в проект

Спасибо за интерес к проекту "ЯиТЫ"! Мы приветствуем любой вклад.

## Как внести вклад

### 1. Найдите или создайте Issue

- Проверьте существующие Issues
- Если вашей проблемы нет, создайте новый Issue
- Опишите проблему или предложение детально

### 2. Fork репозитория

```bash
# Форкните репозиторий через GitHub UI
# Затем клонируйте свой fork
git clone https://github.com/YOUR_USERNAME/I-You.git
cd I-You
```

### 3. Создайте ветку

```bash
git checkout -b feature/your-feature-name
# или
git checkout -b fix/bug-description
```

Именование веток:
- `feature/` - новые функции
- `fix/` - исправления багов
- `docs/` - документация
- `refactor/` - рефакторинг
- `test/` - тесты

### 4. Внесите изменения

Следуйте стайл гайдам проекта (см. ниже).

### 5. Напишите тесты

Если добавляете новую функцию, добавьте тесты.

### 6. Закоммитьте

```bash
git add .
git commit -m "feat: add new feature"
```

Формат commit сообщений:
- `feat:` - новая функция
- `fix:` - исправление бага
- `docs:` - документация
- `style:` - форматирование
- `refactor:` - рефакторинг
- `test:` - тесты
- `chore:` - рутинные задачи

### 7. Push и создайте PR

```bash
git push origin feature/your-feature-name
```

Затем создайте Pull Request через GitHub UI.

## Стайл гайд

### TypeScript

- Используйте строгую типизацию
- Избегайте `any`
- Именуйте интерфейсы с заглавной буквы
- Используйте camelCase для переменных
- Используйте PascalCase для компонентов

```typescript
// ✅ Хорошо
interface User {
  id: string;
  name: string;
}

const getUserById = (id: string): User | null => {
  // ...
}

// ❌ Плохо
interface user {
  id: any;
  name: any;
}

const get_user = (id) => {
  // ...
}
```

### React

- Используйте функциональные компоненты
- Используйте хуки
- Одна компонента = один файл
- Props интерфейсы именуйте как `ComponentNameProps`

```typescript
// ✅ Хорошо
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export default function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Плохо
export default function Button(props: any) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### Backend

- Один endpoint = один controller метод
- Используйте async/await вместо callbacks
- Всегда обрабатывайте ошибки
- Используйте express-validator для валидации

```typescript
// ✅ Хорошо
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const post = await prisma.post.create({ /* ... */ });
    res.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
};

// ❌ Плохо
export const createPost = (req, res) => {
  prisma.post.create({ /* ... */ }).then(post => {
    res.json(post);
  });
};
```

### CSS/Tailwind

- Используйте Tailwind утилиты
- Кастомные классы только если необходимо
- Адаптивность: mobile-first

```tsx
// ✅ Хорошо
<div className="flex flex-col md:flex-row gap-4 p-4">
  {/* ... */}
</div>

// ❌ Плохо
<div style={{ display: 'flex', padding: '16px' }}>
  {/* ... */}
</div>
```

## Области для вклада

### 🐛 Исправление багов
- Проверьте Issues с меткой `bug`
- Воспроизведите баг
- Исправьте и добавьте тест

### ✨ Новые функции
- Обсудите в Issue перед началом работы
- Убедитесь что функция нужна
- Напишите тесты

### 📝 Документация
- Улучшите README
- Добавьте примеры
- Исправьте опечатки
- Переведите на другие языки

### 🎨 UI/UX улучшения
- Улучшите дизайн
- Добавьте анимации
- Сделайте более адаптивным

### 🧪 Тесты
- Добавьте unit тесты
- Добавьте integration тесты
- Добавьте E2E тесты

### ⚡ Производительность
- Оптимизируйте запросы к БД
- Уменьшите размер бандла
- Улучшите время загрузки

### 🔒 Безопасность
- Найдите уязвимости
- Улучшите валидацию
- Добавьте rate limiting

## Приоритетные задачи

### Высокий приоритет
1. Unit тесты для backend
2. E2E тесты для frontend
3. Rate limiting
4. Пагинация постов
5. Оптимизация запросов к БД

### Средний приоритет
1. Загрузка аватаров
2. Темная тема
3. Настройки профиля
4. Экспорт данных
5. Поиск по постам

### Низкий приоритет
1. Локализация (EN)
2. PWA поддержка
3. Offline режим
4. Мобильное приложение

## Процесс ревью

1. Автоматические проверки должны пройти
2. Минимум 1 approver
3. Нет конфликтов
4. Код соответствует стайл гайду
5. Тесты написаны и проходят

## Вопросы?

- Откройте Issue
- Напишите в Discussions
- Свяжитесь с maintainer'ом

## Лицензия

Внося вклад, вы соглашаетесь что ваш код будет лицензирован под MIT License.

## Код поведения

Будьте уважительны и конструктивны. Мы создаем приложение для любви, так что любовь должна быть и в нашем сообществе! ❤️

## Благодарности

Все контрибьюторы будут добавлены в README.md в секцию Contributors.

Спасибо за ваш вклад! 💕
