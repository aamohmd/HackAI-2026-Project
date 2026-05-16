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

export interface OtpResponse {
  detail: string;
  otp_code: string;
  delivery: 'whatsapp' | 'simulated' | 'failed';
}

export const authApi = {
  sendOtp: async (phone_number: string): Promise<OtpResponse> => {
    const { data } = await api.post<OtpResponse>(`auth/send-otp?phone_number=${encodeURIComponent(phone_number)}`);
    return data;
  },

  register: async (phone_number: string, password: string, verification_code: string): Promise<User> => {
    const { data } = await api.post<User>(`auth/register?verification_code=${verification_code}`, { phone_number, password });
    return data;
  },

  login: async (phone_number: string, password: string): Promise<Token> => {
    // FastAPI's OAuth2PasswordRequestForm optimally expects url-encoded form data
    const params = new URLSearchParams();
    params.append('username', phone_number);
    params.append('password', password);

    const { data } = await api.post<Token>('auth/login', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return data;
  },

  refresh: async (): Promise<Token> => {
    const { data } = await api.post<Token>('auth/refresh');
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('auth/logout');
  },
};
