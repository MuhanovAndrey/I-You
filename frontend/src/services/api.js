import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const postService = {
  getPosts: async () => {
    const response = await api.get('/posts/');
    return response.data;
  },

  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (title, content) => {
    const response = await api.post('/posts/', { title, content });
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};

export const reactionService = {
  createReaction: async (postId, reactionType) => {
    const response = await api.post('/reactions/', {
      post_id: postId,
      reaction_type: reactionType,
    });
    return response.data;
  },

  deleteReaction: async (postId) => {
    const response = await api.delete(`/reactions/${postId}`);
    return response.data;
  },

  getReactions: async (postId) => {
    const response = await api.get(`/reactions/${postId}`);
    return response.data;
  },
};

export const commentService = {
  getComments: async (postId) => {
    const response = await api.get(`/comments/${postId}`);
    return response.data;
  },

  createComment: async (postId, content) => {
    const response = await api.post('/comments/', {
      post_id: postId,
      content,
    });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export default api;
