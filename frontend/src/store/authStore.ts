import { create } from 'zustand';
import api from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    telegramUsername: string
  ) => Promise<{ registrationToken: string; telegramStartCode?: string; user: User; requiresTelegramVerification: boolean }>;
  completeRegistration: (registrationToken: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    set({ user, token });
  },

  register: async (email, username, password, telegramUsername) => {
    const response = await api.post('/auth/register', { 
      email, 
      username, 
      password, 
      telegramUsername 
    });
    return response.data;
  },

  completeRegistration: async (registrationToken) => {
    const response = await api.post('/auth/complete-registration', { registrationToken });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      
      const response = await api.get('/users/me');
      set({ user: response.data, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));

// Load user on app start
useAuthStore.getState().loadUser();
