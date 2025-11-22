import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO para atualização de usuário
 * 
 * 📚 SOLID - Open/Closed Principle (OCP):
 * Usando PartialType, estendemos CreateUserDto SEM modificá-lo.
 * Isso torna todos os campos opcionais automaticamente.
 * 
 * Princípio: "Classes devem ser abertas para extensão, mas fechadas para modificação"
 * 
 * 🎯 Benefícios:
 * - Reutilização de validações do CreateUserDto
 * - Não duplicamos código
 * - Se CreateUserDto mudar, UpdateUserDto herda as mudanças
 */

export class UpdateUserDto extends PartialType(CreateUserDto) {
    // Podemos adicionar campos específicos de update aqui se necessário
    // Por exemplo, permitir atualizar senha sem validação de tamanho mínimo
    // (mas vamos manter a validação por segurança)
}
