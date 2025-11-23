export interface User {
    _id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
    role?: 'user' | 'admin';
}

export interface UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    role?: 'user' | 'admin';
}
