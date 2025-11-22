import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service.js';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email', // Usar 'email' ao invés de 'username'
            passwordField: 'password',
        });
    }

    /**
     * Método chamado automaticamente pelo Passport
     * 
     * @param email - Email do formulário de login
     * @param password - Senha do formulário de login
     * @returns Usuário autenticado (sem senha)
     * @throws UnauthorizedException se credenciais inválidas
     */
    async validate(email: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        return user;
    }
}
