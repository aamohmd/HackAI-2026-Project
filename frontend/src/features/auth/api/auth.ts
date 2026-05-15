import api from '@/shared/api/client';

export interface User {
  id: string;
  phone_number: string;
  is_active: boolean;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export const authApi = {
  register: async (phone_number: string, password: string): Promise<User> => {
    const { data } = await api.post<User>('/auth/register', { phone_number, password });
    return data;
  },

  login: async (phone_number: string, password: string): Promise<Token> => {
    // FastAPI's OAuth2PasswordRequestForm expects form data
    const formData = new FormData();
    formData.append('username', phone_number);
    formData.append('password', password);

    const { data } = await api.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  refresh: async (): Promise<Token> => {
    const { data } = await api.post<Token>('/auth/refresh');
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

