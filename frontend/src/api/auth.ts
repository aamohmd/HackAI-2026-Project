import api from './client';

export interface User {
  id: number;
  email: string;
  is_active: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export const authApi = {
  register: async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<User>('/auth/register', { email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<Token> => {
    // FastAPI's OAuth2PasswordRequestForm expects form data
    const formData = new FormData();
    formData.append('username', email);
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

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
