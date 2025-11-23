import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('gdash_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de resposta para lidar com erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se receber 401, redirecionar para login
        if (error.response?.status === 401) {
            localStorage.removeItem('gdash_token');
            localStorage.removeItem('gdash_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
