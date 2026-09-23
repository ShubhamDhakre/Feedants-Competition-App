import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

// Create axios instance with base URL and default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // AsyncStorage read failed — continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — extract data or format errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with an error
      return Promise.reject(error.response.data);
    }
    if (error.request) {
      // Network error — no response received
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }
    return Promise.reject({
      success: false,
      message: 'Something went wrong',
      code: 'UNKNOWN_ERROR',
    });
  }
);

export default api;
