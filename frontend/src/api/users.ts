import api from './client';
import type { User } from './auth';

export interface UserUpdate {
  full_name?: string;
  bio?: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  marketing_emails: boolean;
  security_emails: boolean;
  update_emails: boolean;
}

export const usersApi = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  getMePreferences: async (): Promise<UserPreference> => {
    const { data } = await api.get<UserPreference>('/users/me/preferences');
    return data;
  },

  updateMePreferences: async (prefData: Partial<UserPreference>): Promise<UserPreference> => {
    const { data } = await api.patch<UserPreference>('/users/me/preferences', prefData);
    return data;
  },

  updateMe: async (userData: UserUpdate): Promise<User> => {
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
