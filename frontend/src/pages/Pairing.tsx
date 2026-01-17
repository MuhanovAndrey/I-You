import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PairingRequest } from '../types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function Pairing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [requests, setRequests] = useState<PairingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const requestSeqRef = useRef(0);
  const emptyTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { loadUser, user } = useAuthStore();

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    const normalized = searchQuery.trim();

    if (emptyTimerRef.current) {
      window.clearTimeout(emptyTimerRef.current);
      emptyTimerRef.current = null;
    }
    setShowNoResults(false);

    if (!normalized) {
      setSearchResults([]);
      setSearchPending(false);
      return;
    }

    setSearchPending(true);

    const seq = ++requestSeqRef.current;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        let results: any[] = [];
        const response = await api.get(`/users/search?query=${encodeURIComponent(normalized)}`);
        results = response.data;

        // Ignore out-of-date responses (prevents flicker “ничего не найдено”).
        if (requestSeqRef.current !== seq) return;

        setSearchResults(results);

        if (results.length === 0) {
          emptyTimerRef.current = window.setTimeout(() => {
            // Only show if this is still the latest search.
            if (requestSeqRef.current === seq) setShowNoResults(true);
          }, 600);
        }
      } catch (error) {
        if (requestSeqRef.current === seq) {
          toast.error('Ошибка поиска');
        }
      } finally {
        if (requestSeqRef.current === seq) {
          setSearching(false);
          setSearchPending(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRequests = async () => {
    try {
      const response = await api.get('/pairing/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const sendRequest = async (targetTelegramUsername: string) => {
    setLoading(true);
    try {
      await api.post('/pairing/request', { targetTelegramUsername });
      toast.success('Запрос отправлен! 💌');
      loadRequests();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка отправки запроса');
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    setLoading(true);
    try {
      await api.post(`/pairing/respond/${requestId}`, { accept });
      toast.success(accept ? 'Вы в паре! 💕' : 'Запрос отклонен');
      
      if (accept) {
        await loadUser();
        navigate('/');
      } else {
        loadRequests();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = user?.id;
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const receivedRequests = currentUserId
    ? pendingRequests.filter(r => r.toUserId === currentUserId)
    : [];
  const sentRequests = currentUserId
    ? pendingRequests.filter(r => r.fromUserId === currentUserId)
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="glass-card p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 mb-2 leading-tight pb-1">
            Найти пару ❤️
          </h1>
          <p className="text-gray-600">
            Найдите своего человека и свяжите аккаунты
          </p>
        </div>

        {/* Received Requests */}
        {receivedRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-pink-600">
              Входящие запросы
            </h2>
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{request.fromUser.username}</p>
                    <p className="text-sm text-gray-600">хочет связаться с вами</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToRequest(request.id, true)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                    >
                      Принять
                    </button>
                    <button
                      onClick={() => respondToRequest(request.id, false)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Users */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-pink-400">Поиск пользователя</h2>
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите имя пользователя Telegram (например @ivan123)"
              className="input-field w-full"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="bg-white/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    {user.telegramUsername && (
                      <p className="text-sm text-gray-600">@{user.telegramUsername}</p>
                    )}
                  </div>
                  <button
                    onClick={() => sendRequest(user.telegramUsername)}
                    disabled={loading}
                    className="btn-secondary"
                  >
                    Отправить запрос
                  </button>
                </div>
              ))}
            </div>
          )}

          {!searchPending && !searching && showNoResults && searchQuery.trim() && searchResults.length === 0 && (
            <p className="text-sm text-gray-600">Ничего не найдено</p>
          )}
        </div>

        {/* Sent Requests */}
        {sentRequests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-pink-600">
              Отправленные запросы
            </h2>
            <div className="space-y-2">
              {sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/50 rounded-xl p-4"
                  >
                    <p className="font-semibold">{request.toUser.username}</p>
                    <p className="text-sm text-gray-600">Ожидание ответа...</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
