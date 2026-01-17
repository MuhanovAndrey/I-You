import { useState } from 'react';
import { postService } from '../services/api';
import './CreatePost.css';

function CreatePost({ onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postService.createPost(title, content);
      setTitle('');
      setContent('');
      setIsOpen(false);
      onPostCreated();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  if (!isOpen) {
    return (
      <button className="open-create-btn" onClick={() => setIsOpen(true)}>
        ✨ Поделиться причиной любви
      </button>
    );
  }

  return (
    <div className="create-post">
      <h3>Почему я люблю тебя? 💝</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Заголовок..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Расскажи о причине твоей любви..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows="4"
        />
        <div className="create-post-actions">
          <button type="submit">Опубликовать</button>
          <button type="button" onClick={() => setIsOpen(false)} className="cancel-btn">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
