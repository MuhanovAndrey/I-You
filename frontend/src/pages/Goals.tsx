import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { SharedGoal, SharedGoalItem } from '../types';

function calcProgress(items: SharedGoalItem[]) {
  if (!items.length) return 0;
  const done = items.filter((i) => i.isDone).length;
  return Math.round((done / items.length) * 100);
}

export default function Goals() {
  const { user } = useAuthStore();

  const [goals, setGoals] = useState<SharedGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [newItemByGoalId, setNewItemByGoalId] = useState<Record<string, string>>({});

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка загрузки целей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const totalProgress = useMemo(() => {
    if (!goals.length) return 0;
    const percents = goals.map((g) => calcProgress(g.items));
    return Math.round(percents.reduce((a, b) => a + b, 0) / goals.length);
  }, [goals]);

  const createGoal = async () => {
    const title = newTitle.trim();
    if (!title) return toast.error('Введите название цели');

    setCreating(true);
    try {
      await api.post('/goals', {
        title,
        description: newDescription.trim() || undefined
      });
      setNewTitle('');
      setNewDescription('');
      toast.success('Цель добавлена!');
      loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания цели');
    } finally {
      setCreating(false);
    }
  };

  const addItem = async (goalId: string) => {
    const content = (newItemByGoalId[goalId] || '').trim();
    if (!content) return toast.error('Введите пункт');

    try {
      await api.post(`/goals/${goalId}/items`, { content });
      setNewItemByGoalId((prev) => ({ ...prev, [goalId]: '' }));
      loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка добавления пункта');
    }
  };

  const toggleItem = async (goalId: string, itemId: string) => {
    try {
      await api.patch(`/goals/${goalId}/items/${itemId}`, {});
      loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка');
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!window.confirm('Удалить цель целиком?')) return;

    try {
      await api.delete(`/goals/${goalId}`);
      toast.success('Цель удалена');
      loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const deleteItem = async (goalId: string, itemId: string) => {
    try {
      await api.delete(`/goals/${goalId}/items/${itemId}`);
      loadGoals();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка');
    }
  };

  return (
    <div className="min-h-screen p-4 relative z-10">
      <header className="glass-card p-6 mb-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500/85 to-pink-600/85">
              Цели
            </h1>
            <p className="text-gray-600 mt-1">
              <span className="font-semibold text-pink-600">{user?.username}</span>
              {' '}и{' '}
              <span className="font-semibold text-pink-600">{user?.pairedWith?.username ?? '...'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              Назад
            </Link>
            <Link
              to="/profile"
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              Профиль
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mb-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm text-gray-600">Общий прогресс</div>
              <div className="text-2xl font-bold text-gray-800">{totalProgress}%</div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="h-3 bg-white/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400/85 to-pink-500/85 rounded-full transition-all"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-pink-600 mb-4">Новая цель</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Например: Поехать вместе в горы"
              className="input-field w-full md:col-span-2"
              disabled={creating}
            />
            <button
              onClick={createGoal}
              disabled={creating}
              className="btn-primary"
            >
              {creating ? 'Добавляем...' : 'Добавить'}
            </button>
          </div>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Описание (необязательно)"
            className="input-field w-full mt-3 min-h-[90px]"
            disabled={creating}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Загрузка...</div>
        ) : goals.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600">Пока нет целей. Добавьте первую!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const percent = calcProgress(goal.items);

            return (
              <div key={goal.id} className="glass-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 break-words">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-gray-600 mt-1 break-words">{goal.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-white/50 transition-colors"
                    title="Удалить цель"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Прогресс</span>
                    <span className="font-semibold">{percent}%</span>
                  </div>
                  <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400/85 to-pink-500/85 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {goal.items.length === 0 ? (
                    <div className="text-sm text-gray-600">Добавьте чек-лист для этой цели ✍️</div>
                  ) : (
                    goal.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 bg-white/40 rounded-xl p-3"
                      >
                        <button
                          onClick={() => toggleItem(goal.id, item.id)}
                          className="flex items-center gap-3 text-left flex-1 min-w-0"
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                              item.isDone
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white/70 border-white/70 text-gray-600'
                            }`}
                          >
                            {item.isDone ? '✓' : ''}
                          </span>
                          <span
                            className={`text-gray-800 flex-1 min-w-0 break-words whitespace-pre-wrap ${item.isDone ? 'line-through opacity-70' : ''}`}
                          >
                            {item.content}
                          </span>
                        </button>
                        <button
                          onClick={() => deleteItem(goal.id, item.id)}
                          className="text-gray-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors"
                          title="Удалить пункт"
                        >
                          🗑
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={newItemByGoalId[goal.id] || ''}
                    onChange={(e) => setNewItemByGoalId((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                    placeholder="Добавить пункт…"
                    className="input-field flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addItem(goal.id);
                    }}
                  />
                  <button onClick={() => addItem(goal.id)} className="btn-secondary">
                    +
                  </button>
                </div>

                {percent === 100 && goal.items.length > 0 && (
                  <div className="mt-4 bg-green-500/15 border border-green-500/20 rounded-xl p-4 text-green-700">
                    <div className="font-semibold">Готово! 🎉</div>
                    <div className="text-sm">Эта цель полностью выполнена.</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
