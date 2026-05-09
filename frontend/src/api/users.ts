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

  updateMe: async (userData: UserUpdate): Promise<User> => {
    const { data } = await api.patch<User>('/users/me', userData);
    return data;
  },
};
