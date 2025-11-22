import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * 📚 SOLID - Dependency Inversion Principle (DIP)
 * 
 * Este serviço depende de ABSTRAÇÕES (interfaces/contratos), não de implementações concretas:
 * - Model<User> é uma abstração do Mongoose (pode ser trocado por outro ORM)
 * - bcrypt é injetado como dependência (poderia ser substituído)
 * 
 * Benefícios:
 * - Fácil de testar (podemos mockar Model<User>)
 * - Fácil de trocar implementação (ex: migrar de MongoDB para PostgreSQL)
 * - Baixo acoplamento
 */

/**
 * 📚 SOLID - Single Responsibility Principle (SRP)
 * 
 * Este serviço tem UMA única responsabilidade: gerenciar usuários.
 * Não se preocupa com autenticação, autorização, validação de DTOs, etc.
 * 
 * Responsabilidades:
 * ✅ CRUD de usuários
 * ✅ Hash de senhas
 * ❌ Validação de entrada (feita pelos DTOs)
 * ❌ Autenticação (será feita pelo AuthService)
 * ❌ Autorização (será feita por Guards)
 */

@Injectable()
export class UsersService {
    private readonly SALT_ROUNDS = 10; // Complexidade do hash bcrypt

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    /**
     * 🔐 Função auxiliar para hash de senha
     * SRP: responsabilidade específica de criptografia
     */
    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * ➕ CREATE - Criar novo usuário
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        // 1. Hash da senha (NUNCA salvar senha em texto puro!)
        const hashedPassword = await this.hashPassword(createUserDto.password);

        // 2. Criar usuário com senha hasheada
        const createdUser = await this.userModel.create({
            ...createUserDto,
            password: hashedPassword,
            role: createUserDto.role || 'user', // Default: 'user'
        });

        return createdUser;
    }

    /**
     * 📋 READ ALL - Buscar todos os usuários
     */
    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    /**
     * 🔍 READ ONE - Buscar usuário por ID
     */
    async findOne(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    /**
     * 📧 READ BY EMAIL - Buscar usuário por email
     * Útil para login e verificações de duplicidade
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    /**
     * ✏️ UPDATE - Atualizar usuário
     */
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
        // Se está atualizando a senha, fazer hash
        if (updateUserDto.password) {
            updateUserDto.password = await this.hashPassword(updateUserDto.password);
        }

        return this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true }) // new: true retorna o documento atualizado
            .exec();
    }

    /**
     * 🗑️ DELETE - Remover usuário
     */
    async remove(id: string): Promise<User | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }

    /**
     * ✅ VALIDATE PASSWORD - Comparar senha em texto puro com hash
     * Usado na autenticação
     */
    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * 🌱 CREATE DEFAULT USER - Criar usuário admin padrão
     * Útil para inicialização do sistema
     */
    async createDefaultUser(): Promise<User> {
        const defaultEmail = 'admin@example.com';

        // Verificar se já existe
        const existingUser = await this.findByEmail(defaultEmail);
        if (existingUser) {
            console.log('ℹ️  Usuário padrão já existe');
            return existingUser;
        }

        // Criar usuário admin
        const defaultUser = await this.create({
            email: defaultEmail,
            password: 'admin123',
            name: 'Administrador',
            role: 'admin' as any,
        });

        console.log('✅ Usuário padrão criado:', defaultEmail);
        return defaultUser;
    }
}

/**
 * 📚 RESUMO DOS PRINCÍPIOS SOLID APLICADOS:
 * 
 * ✅ S - Single Responsibility: Cada método tem uma responsabilidade específica
 * ✅ O - Open/Closed: Podemos estender (herança) sem modificar
 * ✅ L - Liskov Substitution: Qualquer Model<User> funciona
 * ✅ I - Interface Segregation: Usamos apenas métodos necessários do Model
 * ✅ D - Dependency Inversion: Dependemos de abstrações (Model), não implementações
 * 
 * 🧪 TESTABILIDADE:
 * - Fácil de mockar dependências
 * - Cada método é testável isoladamente
 * - Sem efeitos colaterais complexos
 */
