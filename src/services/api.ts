import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// 10.0.2.2 is the special IP for Android Emulators to connect to host computer's localhost.
// We fallback to localhost for normal devices or debugging.
export const API_BASE_URL = 'http://10.0.2.2:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
