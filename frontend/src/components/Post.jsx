import { useState, useEffect } from 'react';
import { commentService } from '../services/api';
import './Post.css';

function Post({ post, onReaction, onComment, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    try {
      const data = await commentService.getComments(post.id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    await onComment(post.id, newComment);
    setNewComment('');
    loadComments();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-author">
          <span className="author-name">{post.author.username}</span>
          <span className="post-date">{formatDate(post.created_at)}</span>
        </div>
      </div>

      <div className="post-content">
        <h3>{post.title}</h3>
        <p>{post.content}</p>
      </div>

      <div className="post-actions">
        <div className="reactions">
          <button onClick={() => onReaction(post.id, 'heart')} className="reaction-btn">
            ❤️ {post.reactions_count?.heart || 0}
          </button>
          <button onClick={() => onReaction(post.id, 'love')} className="reaction-btn">
            😍 {post.reactions_count?.love || 0}
          </button>
          <button onClick={() => onReaction(post.id, 'like')} className="reaction-btn">
            👍 {post.reactions_count?.like || 0}
          </button>
          <button onClick={() => onReaction(post.id, 'smile')} className="reaction-btn">
            😊 {post.reactions_count?.smile || 0}
          </button>
        </div>

        <button 
          onClick={() => setShowComments(!showComments)} 
          className="comments-toggle"
        >
          💬 {post.comments_count || 0} комментариев
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Написать комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit">Отправить</button>
          </form>

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.author.username}</span>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
