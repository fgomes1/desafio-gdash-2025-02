import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Valida as credenciais do usuário
     * 
     * @param email - Email do usuário
     * @param password - Senha em texto puro
     * @returns Usuário sem senha se válido, null caso contrário
     * 
     * 🔒 Segurança:
     * - Compara hash bcrypt (não texto puro)
     * - Remove senha antes de retornar
     * - Retorna null em caso de falha (não expõe motivo)
     */
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);

        if (!user || !user.password) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        // Construir objeto manualmente para garantir que as propriedades existam
        // e eliminar problemas com o objeto do Mongoose
        return {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }

    /**
     * Gera token JWT para usuário autenticado
     * 
     * @param user - Dados do usuário (sem senha)
     * @returns Objeto com access_token e informações do usuário
     * 
     * 📝 Payload do JWT:
     * - sub: ID do usuário (subject)
     * - email: Email do usuário
     * - role: Papel do usuário (user, admin, etc.)
     * 
     * ⏱️ Expiração configurada via JWT_EXPIRES_IN no .env
     */
    async login(user: any) {
        console.log('DEBUG: User inside login service:', user);
        const payload = {
            email: user.email,
            sub: user._id || user.id,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id || user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
}
