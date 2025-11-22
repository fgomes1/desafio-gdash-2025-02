import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';


export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export class CreateUserDto {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    email: string;

    @IsString({ message: 'Senha deve ser uma string' })
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    password: string;

    @IsString({ message: 'Nome deve ser uma string' })
    @IsOptional()
    name?: string;

    @IsEnum(UserRole, { message: 'Role deve ser "user" ou "admin"' })
    @IsOptional()
    role?: UserRole;
}
