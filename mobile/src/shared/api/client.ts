import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const TOKEN_KEY = 'access_token';

let accessToken: string | null = null;

export const setAccessToken = async (token: string | null) => {
  accessToken = token;
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

export const getAccessToken = async () => {
  if (!accessToken) {
    accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
  }
  return accessToken;
};

/**
 * Dynamically resolve the API base URL.
 * Localhost does not work on physical devices, so we extract the host IP 
 * from the Expo development server's URI if available.
 */
const getBaseUrl = () => {
  // Check if we are in a development environment with a host URI
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (__DEV__ && hostUri) {
    // hostUri is typically '192.168.x.x:8081'
    const host = hostUri.split(':')[0];
    return `http://${host}:8000/`;
  }
  
  // Fallback for production or environments where hostUri is missing
  return 'http://localhost:8000/'; 
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Crucial for HttpOnly cookie support
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for silent refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and it's not a retry and not a login/refresh request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('auth/login') &&
      !originalRequest.url?.includes('auth/refresh')
    ) {
      originalRequest._retry = true;
      
      try {
        // Use path alias for dynamic import to maintain consistency
        const { authApi } = await import('@/features/auth/api/auth');
        const { access_token } = await authApi.refresh();
        
        await setAccessToken(access_token);
        
        // Update header and retry
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear token
        await setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
