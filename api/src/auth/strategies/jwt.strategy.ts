import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-change-me',
        });
    }

    /**
     * Método chamado após JWT ser validado
     * 
     * @param payload - Payload decodificado do JWT
     * @returns Dados do usuário que serão anexados a request.user
     * 
     * 📝 Payload contém:
     * - sub: ID do usuário
     * - email: Email do usuário
     * - role: Papel do usuário
     * - iat: Timestamp de criação
     * - exp: Timestamp de expiração
     */
    async validate(payload: any) {
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
