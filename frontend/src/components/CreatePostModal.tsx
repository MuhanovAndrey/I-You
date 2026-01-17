import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  type: 'loveReason' | 'giftIdea' | 'statePost';
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePostModal({ type, onClose, onCreated }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stateType, setStateType] = useState<'physical' | 'emotional'>('emotional');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'loveReason') {
        await api.post('/love-reasons', { content });
      } else if (type === 'giftIdea') {
        await api.post('/gift-ideas', { title, description });
      } else {
        await api.post('/state-posts', { type: stateType, content });
      }
      toast.success('Пост создан! 💕');
      onCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания поста');
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (type === 'loveReason') return 'Новая причина любви ❤️';
    if (type === 'giftIdea') return 'Новая идея подарка 🎁';
    return 'Моё состояние 💭';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500/85 to-pink-600/85">
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'loveReason' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                За что вы любите своего человека?
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field min-h-[120px] resize-none"
                placeholder="Например: За твою искреннюю улыбку..."
                required
              />
            </div>
          )}

          {type === 'giftIdea' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название подарка
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Например: Букет роз"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание (необязательно)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Дополнительные детали..."
                />
              </div>
            </>
          )}

          {type === 'statePost' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип состояния
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="emotional"
                      checked={stateType === 'emotional'}
                      onChange={(e) => setStateType(e.target.value as 'emotional')}
                      className="mr-2"
                    />
                    <span>💭 Эмоциональное</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="physical"
                      checked={stateType === 'physical'}
                      onChange={(e) => setStateType(e.target.value as 'physical')}
                      className="mr-2"
                    />
                    <span>💪 Физическое</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Как вы себя чувствуете?
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Опишите своё состояние..."
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Создание...' : 'Создать пост'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
