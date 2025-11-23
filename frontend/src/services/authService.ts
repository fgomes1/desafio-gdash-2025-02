import { api } from '@/services/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
}

export interface AuthResponse {
    access_token: string;
    user: {
        _id: string;
        email: string;
        name: string;
        role: string;
    };
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);
        return data;
    },

    async register(userData: RegisterData): Promise<any> {
        const { data } = await api.post('/users', userData);
        return data;
    },

    async getProfile(): Promise<any> {
        const { data } = await api.get('/auth/profile');
        return data;
    }
};
