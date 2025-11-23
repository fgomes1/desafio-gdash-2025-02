import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Autenticar usuário',
        description: 'Endpoint para login. Retorna token JWT e dados do usuário.'
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: '507f1f77bcf86cd799439011',
                    email: 'user@example.com',
                    name: 'User Name',
                    role: 'user'
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciais inválidas'
    })
    @UseGuards(LocalAuthGuard)
    async login(@Body() loginDto: LoginDto, @Request() req) {
        console.log('DEBUG: req.user in Controller:', req.user);
        return this.authService.login(req.user);
    }

    @Get('profile')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Obter perfil do usuário autenticado',
        description: 'Retorna dados do usuário autenticado via JWT token'
    })
    @ApiResponse({
        status: 200,
        description: 'Perfil do usuário',
        schema: {
            example: {
                email: 'user@example.com',
                sub: '507f1f77bcf86cd799439011',
                role: 'user',
                iat: 1234567890,
                exp: 1234567890
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Token inválido ou não fornecido'
    })
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return req.user;
    }
}
