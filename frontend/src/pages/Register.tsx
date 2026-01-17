import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'telegram'>('form');
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [telegramStartCode, setTelegramStartCode] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { register, completeRegistration } = useAuthStore();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!registrationToken) return;

    let cancelled = false;
    const interval = window.setInterval(async () => {
      if (cancelled) return;
      try {
        await completeRegistration(registrationToken);
        if (cancelled) return;
        toast.success('Telegram подтвержден! Регистрация завершена 💕');
        navigate('/pairing');
      } catch (error: any) {
        // 409 = not verified yet; keep polling silently
        if (error?.response?.status === 409) return;
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [registrationToken, completeRegistration, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await register(email, username, password, telegramUsername);
      setRegistrationToken(data.registrationToken);
      setTelegramStartCode(data.telegramStartCode ?? null);
      setStep('telegram');
      toast.success('Почти готово! Подтверди Telegram в боте');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  const openTelegramBot = () => {
    if (!botUsername) {
      toast.error('Имя Telegram-бота не настроено');
      return;
    }

    const url = telegramStartCode
      ? `https://t.me/${botUsername}?start=${encodeURIComponent(telegramStartCode)}`
      : `https://t.me/${botUsername}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const cancelAndBackToForm = async () => {
    if (!registrationToken) {
      setStep('form');
      setTelegramStartCode(null);
      return;
    }

    setCancelling(true);
    try {
      await api.post('/auth/cancel-registration', { registrationToken });
      toast.success('Регистрация отменена');
      setStep('form');
      setRegistrationToken(null);
      setTelegramStartCode(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Не удалось отменить регистрацию');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="glass-card p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500/85 to-pink-600/85 mb-2">
            ЯиТЫ
          </h1>
          <p className="text-gray-600">Создайте аккаунт</p>
        </div>

        {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя пользователя
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя пользователя Telegram
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 z-10 text-gray-900 font-semibold pointer-events-none">@</span>
              <input
                type="text"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                className="input-field pl-8"
                placeholder=""
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        )}

        {step === 'telegram' && (
          <div className="space-y-4">
            <div className="bg-white/50 rounded-xl p-4 border border-pink-200">
              <h2 className="text-lg font-semibold text-pink-600">Подтвердите Telegram</h2>
              <p className="text-sm text-gray-700 mt-2">
                1) Нажмите «Открыть Telegram-бота»
                <br />
                2) В боте нажмите <b>/start</b> (откроется с кодом подтверждения)
                <br />
                3) Вернитесь сюда — регистрация завершится автоматически
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2" >
              <button type="button" onClick={openTelegramBot} className="btn-secondary w-full">
                Открыть Telegram-бота
              </button>
            </div>

            <button
              type="button"
              className="btn-secondary w-full"
              disabled={cancelling}
              onClick={cancelAndBackToForm}
            >
              {cancelling ? 'Отменяем…' : 'Назад к форме'}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-pink-600 font-semibold hover:text-pink-700">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
