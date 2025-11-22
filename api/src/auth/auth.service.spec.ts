import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');



describe('AuthService', () => {
    let authService: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: '$2b$10$hashedPassword123', // Senha hash (bcrypt)
        name: 'Test User',
        role: 'user',
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    /**
     * 🧪 TESTE 1: Validar usuário com credenciais corretas
     * 
     * Cenário: Usuário fornece email e senha corretos
     * Resultado esperado: Retorna usuário SEM a senha
     */
    describe('validateUser', () => {
        it('should return user without password when credentials are correct', async () => {
            // Arrange
            const email = 'test@example.com';
            const password = 'plainPassword123';

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            // Act
            const result = await authService.validateUser(email, password);

            // Assert
            expect(result).toBeDefined();
            expect(result.email).toBe(email);
            expect(result.password).toBeUndefined(); // ❗ Senha NUNCA deve ser retornada
            expect(usersService.findByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
        });

        /**
         * 🧪 TESTE 2: Rejeitar usuário com senha incorreta
         * 
         * Cenário: Usuário existe mas senha está incorreta
         * Resultado esperado: Retorna null
         */
        it('should return null when password is incorrect', async () => {
            // Arrange
            const email = 'test@example.com';
            const wrongPassword = 'wrongPassword';

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act
            const result = await authService.validateUser(email, wrongPassword);

            // Assert
            expect(result).toBeNull();
            expect(usersService.findByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.compare).toHaveBeenCalledWith(wrongPassword, mockUser.password);
        });

        /**
         * 🧪 TESTE 3: Rejeitar quando usuário não existe
         * 
         * Cenário: Email não está cadastrado no sistema
         * Resultado esperado: Retorna null
         */
        it('should return null when user does not exist', async () => {
            // Arrange
            const email = 'nonexistent@example.com';
            const password = 'anyPassword';

            mockUsersService.findByEmail.mockResolvedValue(null);

            // Act
            const result = await authService.validateUser(email, password);

            // Assert
            expect(result).toBeNull();
            expect(usersService.findByEmail).toHaveBeenCalledWith(email);
            // bcrypt.compare não deve ser chamado quando usuário não existe
        });
    });

    /**
     * 🧪 TESTE 4: Gerar token JWT válido
     * 
     * Cenário: Usuário autenticado precisa de um token
     * Resultado esperado: Token JWT + dados do usuário (sem senha)
     */
    describe('login', () => {
        it('should generate a valid JWT token', async () => {
            // Arrange
            const user = {
                _id: mockUser._id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
            };

            const mockToken = 'mock.jwt.token';
            mockJwtService.sign.mockReturnValue(mockToken);

            // Act
            const result = await authService.login(user);

            // Assert
            expect(result).toBeDefined();
            expect(result.access_token).toBe(mockToken);
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(user.email);
            expect(result.user.id).toBe(user._id);
            expect(result.user).not.toHaveProperty('password');
        });

        /**
         * 🧪 TESTE 5: JWT payload deve conter informações corretas
         * 
         * Cenário: Verificar estrutura do payload do token
         * Resultado esperado: Payload contém sub (userId) e email
         */
        it('should include correct payload in JWT token', async () => {
            // Arrange
            const user = {
                _id: mockUser._id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
            };

            const mockToken = 'mock.jwt.token';
            mockJwtService.sign.mockReturnValue(mockToken);

            // Act
            await authService.login(user);

            // Assert
            expect(jwtService.sign).toHaveBeenCalledWith({
                email: user.email,
                sub: user._id,
                role: user.role,
            });
        });

        /**
         * 🧪 TESTE 6: Retornar informações do usuário no login
         * 
         * Cenário: Além do token, frontend precisa de dados do usuário
         * Resultado esperado: Objeto com access_token e user
         */
        it('should return user information along with token', async () => {
            // Arrange
            const user = {
                _id: mockUser._id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
            };

            const mockToken = 'mock.jwt.token';
            mockJwtService.sign.mockReturnValue(mockToken);

            // Act
            const result = await authService.login(user);

            // Assert
            expect(result.user).toEqual({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            });
        });
    });
});
