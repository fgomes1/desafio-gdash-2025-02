import { api } from './api';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

export const userService = {
    // Listar todos os usuários (apenas admin)
    async findAll(): Promise<User[]> {
        const response = await api.get('/users');
        return response.data;
    },

    // Buscar usuário por ID
    async findOne(id: string): Promise<User> {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    // Criar novo usuário
    async create(data: CreateUserDto): Promise<User> {
        const response = await api.post('/users', data);
        return response.data;
    },

    // Atualizar usuário
    async update(id: string, data: UpdateUserDto): Promise<User> {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    // Deletar usuário (apenas admin)
    async delete(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};
