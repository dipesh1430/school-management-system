import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development, use your computer's IP address instead of localhost for Android emulator or physical device.
// You might need to change this IP to match your actual local IPv4 address (e.g., 192.168.1.5)
const API_URL = 'http://192.168.0.108:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
