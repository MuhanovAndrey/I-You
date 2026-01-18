import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PostCardProps {
  post: any;
  currentUserId: string;
  onReaction: (targetType: string, targetId: string, reactionType: string) => void;
  onComment: (targetType: string, targetId: string, content: string) => void;
  onDelete: (type: string, id: string) => void;
}

export default function PostCard({ post, currentUserId, onReaction, onComment, onDelete }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const getPostIcon = () => {
    if (post.postType === 'loveReason') return '❤️';
    if (post.postType === 'giftIdea') return '🎁';
    return '💭';
  };

  const getPostTitle = () => {
    if (post.postType === 'loveReason') return 'Причина любви';
    if (post.postType === 'giftIdea') return 'Идея подарка';
    if (post.type === 'physical') return 'Физическое состояние';
    return 'Эмоциональное состояние';
  };

  const handleReact = (type: string) => {
    onReaction(post.postType, post.id, type);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.postType, post.id, commentText);
    setCommentText('');
  };

  const userReactions = post.reactions?.filter((r: any) => r.userId === currentUserId) || [];
  const hasReaction = (type: string) => userReactions.some((r: any) => r.type === type);

  const reactionCounts = post.reactions?.reduce((acc: any, r: any) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getPostIcon()}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{post.user.username}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })}
              </span>
            </div>
            <p className="text-sm text-gray-600">{getPostTitle()}</p>
          </div>
        </div>
        {post.userId === currentUserId && (
          <button
            onClick={() => onDelete(post.postType === 'loveReason' ? 'love-reasons' : post.postType === 'giftIdea' ? 'gift-ideas' : 'state-posts', post.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        {post.postType === 'giftIdea' ? (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
            {post.description && <p className="text-gray-700">{post.description}</p>}
          </>
        ) : (
          <p className="text-gray-700">{post.content}</p>
        )}
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 mb-4 flex-wrap overflow-hidden">
        {['❤️', '🥰', '😊', '👍', '🔥'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className={`px-3 py-1.5 rounded-full transition-all ${
              hasReaction(emoji)
                ? 'bg-pink-100 border-2 border-pink-400 sm:scale-110'
                : 'bg-white/50 hover:bg-white border border-gray-200'
            }`}
          >
            <span className="text-lg">{emoji}</span>
            {reactionCounts[emoji] > 0 && (
              <span className="ml-1 text-sm font-semibold">{reactionCounts[emoji]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Comments Toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-gray-600 hover:text-gray-800 text-sm font-medium mb-4"
      >
        💬 Комментарии ({post.comments?.length || 0})
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Написать комментарий..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none bg-white/70 min-w-0"
            />
            <button
              type="submit"
              className="btn-primary px-6 py-2 w-full sm:w-auto"
            >
              Отправить
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments?.map((comment: any) => (
              <div key={comment.id} className="bg-white/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.user.username}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm break-words whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
