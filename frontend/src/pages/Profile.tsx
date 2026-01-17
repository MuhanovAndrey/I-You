import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user, loadUser, logout } = useAuthStore();
  const [email, setEmail] = useState(user?.email ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [telegramUsername, setTelegramUsername] = useState(user?.telegramUsername ?? '');
  const [loading, setLoading] = useState(false);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [telegramTesting, setTelegramTesting] = useState(false);

  const normalizedTelegram = useMemo(() => {
    const trimmed = (telegramUsername ?? '').trim();
    return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  }, [telegramUsername]);

  useEffect(() => {
    setEmail(user?.email ?? '');
    setUsername(user?.username ?? '');
    setTelegramUsername(user?.telegramUsername ?? '');
  }, [user?.email, user?.username, user?.telegramUsername]);

  useEffect(() => {
    const loadBot = async () => {
      try {
        const res = await api.get('/telegram/bot');
        setBotUsername(res.data?.botUsername ?? null);
      } catch {
        setBotUsername(null);
      }
    };
    loadBot();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch('/users/me', {
        email,
        username,
        telegramUsername,
      });
      await loadUser();
      toast.success('Профиль обновлён');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  const openTelegramBot = () => {
    if (!botUsername) {
      toast.error('Имя Telegram-бота не настроено');
      return;
    }

    window.open(`https://t.me/${botUsername}`, '_blank', 'noopener,noreferrer');
  };

  const testTelegram = async () => {
    setTelegramTesting(true);
    try {
      await api.post('/telegram/test');
      toast.success('Проверка отправлена в Telegram');
      await loadUser();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось проверить Telegram');
    } finally {
      setTelegramTesting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 relative z-10">
      <header className="glass-card p-6 mb-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500/85 to-pink-600/85">
              ЯиТЫ
            </h1>
            <p className="text-gray-600 mt-1">
              Профиль пользователя <span className="font-semibold text-pink-600">{user?.username}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-800 px-4 py-2 rounded-lg bg-white/40">Профиль</span>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-pink-600 mb-4">Данные аккаунта</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                required
                minLength={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <label className="block text-sm font-medium text-gray-700">Имя пользователя Telegram</label>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${user?.telegramVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {user?.telegramVerified ? 'Подключён' : 'Не подключён'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3.5 z-10 text-gray-900 font-semibold pointer-events-none">@</span>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="input-field pl-8"
                  placeholder="username"
                  required
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" onClick={openTelegramBot} className="btn-secondary">
                  Открыть Telegram-бота
                </button>
                <button
                  type="button"
                  onClick={testTelegram}
                  disabled={telegramTesting}
                  className="btn-primary"
                >
                  {telegramTesting ? 'Проверяем...' : 'Проверить Telegram'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Как подключить: сохраните имя пользователя Telegram, нажмите «Открыть Telegram-бота» и нажмите <b>/start</b>. Затем нажмите «Проверить Telegram».
              </p>
              {normalizedTelegram && (
                <p className="text-xs text-gray-500 mt-1">Текущий: @{normalizedTelegram}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-pink-600 mb-4">Навигация</h2>
          <div className="space-y-2">
            <Link to="/" className="btn-secondary w-full inline-flex justify-center">
              На главную
            </Link>
            {/* <Link to="/pairing" className="btn-secondary w-full inline-flex justify-center">
              Найти пару
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}
