import { useState, useEffect } from 'react';
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
  const navigate = useNavigate();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.get('/pairing/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`/users/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Ошибка поиска');
    }
  };

  const sendRequest = async (targetUsername: string) => {
    setLoading(true);
    try {
      await api.post('/pairing/request', { targetUsername });
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const receivedRequests = pendingRequests.filter(r => r.toUserId !== r.fromUserId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="glass-card p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
            Найти пару 💑
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
          <h2 className="text-xl font-semibold text-pink-600">Поиск пользователя</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Введите имя пользователя..."
              className="input-field flex-1"
            />
            <button onClick={searchUsers} className="btn-primary">
              Поиск
            </button>
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
                    onClick={() => sendRequest(user.username)}
                    disabled={loading}
                    className="btn-secondary"
                  >
                    Отправить запрос
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Requests */}
        {pendingRequests.some(r => r.fromUserId === r.toUserId) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-pink-600">
              Отправленные запросы
            </h2>
            <div className="space-y-2">
              {pendingRequests
                .filter(r => r.fromUserId === r.toUserId)
                .map((request) => (
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
