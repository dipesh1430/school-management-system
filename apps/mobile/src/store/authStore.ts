import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
  profilePic?: string;
}

interface Profile {
  _id: string;
  classId?: { _id: string; name: string };
  sectionId?: { _id: string; name: string };
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  token: null,
  isLoading: true,
  
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Fetch profile
      let profile = null;
      try {
        const profileRes = await api.get('/users/me/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        profile = profileRes.data.profile;
        if (profile) await AsyncStorage.setItem('profile', JSON.stringify(profile));
      } catch (e) { console.error('Failed to fetch profile', e); }
      
      set({ user, token, profile });
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('profile');
    set({ user: null, token: null, profile: null });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      const profileStr = await AsyncStorage.getItem('profile');
      
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), profile: profileStr ? JSON.parse(profileStr) : null });
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
