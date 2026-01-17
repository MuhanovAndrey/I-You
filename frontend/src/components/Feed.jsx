import { useState, useEffect } from 'react';
import { postService, reactionService, commentService } from '../services/api';
import Post from './Post';
import CreatePost from './CreatePost';
import './Feed.css';

function Feed({ onLogout, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await postService.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostCreated = () => {
    loadPosts();
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      await reactionService.createReaction(postId, reactionType);
      loadPosts();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      await commentService.createComment(postId, content);
      loadPosts();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="feed-container">
      <header className="feed-header">
        <h1>I&You 💕</h1>
        <div className="user-info">
          <span>Привет, {currentUser?.username}!</span>
          <button onClick={onLogout} className="logout-btn">
            Выйти
          </button>
        </div>
      </header>

      <div className="feed-content">
        <CreatePost onPostCreated={handlePostCreated} />

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onReaction={handleReaction}
                onComment={handleComment}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
