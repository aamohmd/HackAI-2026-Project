import api from './client';
import type { User } from './auth';

export interface UserUpdate {
  full_name?: string;
  bio?: string;
}

export const userApi = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  updateMe: async (userData: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>('/users/me', userData);
    return data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  };

