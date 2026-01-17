import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { LoveReason, GiftIdea, StatePost } from '../types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

type PostType = 'all' | 'loveReasons' | 'giftIdeas' | 'statePosts';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<PostType>('all');
  const [loveReasons, setLoveReasons] = useState<LoveReason[]>([]);
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [statePosts, setStatePosts] = useState<StatePost[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'loveReason' | 'giftIdea' | 'statePost'>('loveReason');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPosts();
  }, []);

  const loadAllPosts = async () => {
    setLoading(true);
    try {
      const [loveRes, giftRes, stateRes] = await Promise.all([
        api.get('/love-reasons'),
        api.get('/gift-ideas'),
        api.get('/state-posts'),
      ]);
      setLoveReasons(loveRes.data);
      setGiftIdeas(giftRes.data);
      setStatePosts(stateRes.data);
    } catch (error) {
      toast.error('Ошибка загрузки постов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = (type: 'loveReason' | 'giftIdea' | 'statePost') => {
    setCreateType(type);
    setShowCreateModal(true);
  };

  const handlePostCreated = () => {
    loadAllPosts();
    setShowCreateModal(false);
  };

  const handleReaction = async (targetType: string, targetId: string, reactionType: string) => {
    try {
      await api.post('/reactions', { targetType, targetId, type: reactionType });
      loadAllPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка');
    }
  };

  const handleComment = async (targetType: string, targetId: string, content: string) => {
    try {
      await api.post('/comments', { targetType, targetId, content });
      loadAllPosts();
      toast.success('Комментарий добавлен! 💬');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm('Удалить этот пост?')) return;

    try {
      await api.delete(`/${type}/${id}`);
      loadAllPosts();
      toast.success('Пост удален');
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const getAllPosts = () => {
    const all: any[] = [
      ...loveReasons.map(p => ({ ...p, postType: 'loveReason' })),
      ...giftIdeas.map(p => ({ ...p, postType: 'giftIdea' })),
      ...statePosts.map(p => ({ ...p, postType: 'statePost' })),
    ];
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getFilteredPosts = () => {
    if (activeTab === 'all') return getAllPosts();
    if (activeTab === 'loveReasons') return loveReasons.map(p => ({ ...p, postType: 'loveReason' }));
    if (activeTab === 'giftIdeas') return giftIdeas.map(p => ({ ...p, postType: 'giftIdea' }));
    if (activeTab === 'statePosts') return statePosts.map(p => ({ ...p, postType: 'statePost' }));
    return [];
  };

  return (
    <div className="min-h-screen p-4 relative z-10">
      {/* Header */}
      <header className="glass-card p-6 mb-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              ЯиТЫ
            </h1>
            <p className="text-gray-600 mt-1">
              Вы и <span className="font-semibold text-pink-600">{user?.pairedWith?.username}</span> 💕
            </p>
          </div>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Create Buttons */}
      <div className="max-w-4xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleCreatePost('loveReason')}
          className="glass-card p-6 text-center hover:scale-105 transition-transform"
        >
          <div className="text-4xl mb-2">❤️</div>
          <h3 className="font-semibold text-pink-600">Причина любви</h3>
          <p className="text-sm text-gray-600 mt-1">За что я тебя люблю</p>
        </button>

        <button
          onClick={() => handleCreatePost('giftIdea')}
          className="glass-card p-6 text-center hover:scale-105 transition-transform"
        >
          <div className="text-4xl mb-2">🎁</div>
          <h3 className="font-semibold text-purple-600">Идея подарка</h3>
          <p className="text-sm text-gray-600 mt-1">Что хочу подарить</p>
        </button>

        <button
          onClick={() => handleCreatePost('statePost')}
          className="glass-card p-6 text-center hover:scale-105 transition-transform"
        >
          <div className="text-4xl mb-2">💭</div>
          <h3 className="font-semibold text-blue-600">Моё состояние</h3>
          <p className="text-sm text-gray-600 mt-1">Как я себя чувствую</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="glass-card p-2 flex gap-2">
          {[
            { key: 'all', label: 'Все', icon: '📝' },
            { key: 'loveReasons', label: 'Любовь', icon: '❤️' },
            { key: 'giftIdeas', label: 'Подарки', icon: '🎁' },
            { key: 'statePosts', label: 'Состояния', icon: '💭' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as PostType)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Загрузка...</div>
        ) : getFilteredPosts().length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">💌</div>
            <p className="text-gray-600">Пока нет постов. Создайте первый!</p>
          </div>
        ) : (
          getFilteredPosts().map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user!.id}
              onReaction={handleReaction}
              onComment={handleComment}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePostModal
          type={createType}
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}
