import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
    let service: UsersService;
    let model: Model<User>;

    /**
     * Mock do Mongoose Model
     * Vamos simular o comportamento do banco de dados
     */
    const mockUserModel = {
        new: jest.fn(),
        constructor: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        exec: jest.fn(),
    };

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword', // Simulando hash bcrypt
        name: 'Test User',
        role: 'user',
        save: jest.fn().mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        model = module.get<Model<User>>(getModelToken(User.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    /**
     * 🧪 TESTE 1: Criar usuário deve fazer hash da senha
     * 
     * Este é um teste CRÍTICO de segurança.
     * NUNCA devemos armazenar senhas em texto puro.
     */
    describe('create', () => {
        it('should hash the password before saving', async () => {
            const createUserDto: CreateUserDto = {
                email: 'newuser@example.com',
                password: 'plainPassword123',
                name: 'New User',
                role: UserRole.USER,
            };

            // Mock do comportamento
            mockUserModel.create = jest.fn().mockResolvedValue({
                ...createUserDto,
                password: expect.not.stringContaining('plainPassword123'), // Senha NÃO deve ser texto puro
                _id: '507f1f77bcf86cd799439011',
            });

            const result = await service.create(createUserDto);

            expect(result).toBeDefined();
            expect(result.email).toBe(createUserDto.email);
            // A senha retornada NÃO deve ser a senha original
            expect(result.password).not.toBe('plainPassword123');
        });

        it('should create a user with default role "user" if not specified', async () => {
            const createUserDto: CreateUserDto = {
                email: 'newuser@example.com',
                password: 'password123',
            };

            mockUserModel.create = jest.fn().mockResolvedValue({
                ...createUserDto,
                password: '$2b$10$hashed',
                role: 'user',
            });

            const result = await service.create(createUserDto);
            expect(result.role).toBe('user');
        });
    });

    /**
     * 🧪 TESTE 2: Buscar todos os usuários
     */
    describe('findAll', () => {
        it('should return an array of users', async () => {
            const mockUsers = [mockUser, { ...mockUser, email: 'another@example.com' }];

            jest.spyOn(model, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUsers),
            } as any);

            const result = await service.findAll();

            expect(result).toEqual(mockUsers);
            expect(model.find).toHaveBeenCalled();
        });

        it('should return empty array when no users exist', async () => {
            jest.spyOn(model, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            } as any);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    /**
     * 🧪 TESTE 3: Buscar um usuário por ID
     */
    describe('findOne', () => {
        it('should return a user by id', async () => {
            jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            } as any);

            const result = await service.findOne('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockUser);
            expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should return null if user not found', async () => {
            jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);

            const result = await service.findOne('nonexistent');

            expect(result).toBeNull();
        });
    });

    /**
     * 🧪 TESTE 4: Buscar usuário por email
     */
    describe('findByEmail', () => {
        it('should return a user by email', async () => {
            jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            } as any);

            const result = await service.findByEmail('test@example.com');

            expect(result).toEqual(mockUser);
            expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });
    });

    /**
     * 🧪 TESTE 5: Atualizar usuário
     */
    describe('update', () => {
        it('should update a user', async () => {
            const updateUserDto: UpdateUserDto = {
                name: 'Updated Name',
            };

            const updatedUser = { ...mockUser, name: 'Updated Name' };

            jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedUser),
            } as any);

            const result = await service.update('507f1f77bcf86cd799439011', updateUserDto);

            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(result!.name).toBe('Updated Name');
        });

        it('should hash password if updating password', async () => {
            const updateUserDto: UpdateUserDto = {
                password: 'newPassword123',
            };

            jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    ...mockUser,
                    password: '$2b$10$newhash',
                }),
            } as any);

            const result = await service.update('507f1f77bcf86cd799439011', updateUserDto);

            // A senha NÃO deve ser texto puro
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(result!.password).not.toBe('newPassword123');
        });
    });

    /**
     * 🧪 TESTE 6: Deletar usuário
     */
    describe('remove', () => {
        it('should delete a user', async () => {
            jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            } as any);

            const result = await service.remove('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockUser);
            expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });
    });
});
