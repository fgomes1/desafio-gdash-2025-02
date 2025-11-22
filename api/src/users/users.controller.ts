import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({
        summary: 'Criar novo usuário (Registro)',
        description: 'Endpoint público para registro de novos usuários. Não requer autenticação.'
    })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'Usuário criado com sucesso',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                name: 'João Silva',
                email: 'joao@example.com',
                role: 'user',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos ou email já cadastrado'
    })
    create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Listar todos os usuários (ADMIN)',
        description: 'Retorna lista de todos os usuários. APENAS ADMINISTRADORES podem acessar.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de usuários retornada com sucesso',
        schema: {
            example: [{
                _id: '507f1f77bcf86cd799439011',
                name: 'João Silva',
                email: 'joao@example.com',
                role: 'user',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            }]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado - Token inválido ou ausente'
    })
    @ApiResponse({
        status: 403,
        description: 'Acesso negado - Apenas administradores'
    })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Buscar usuário por ID',
        description: 'Retorna dados de um usuário específico. Usuários podem ver apenas seu próprio perfil. Admins podem ver qualquer perfil.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID do usuário (MongoDB ObjectId)',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuário encontrado',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                name: 'João Silva',
                email: 'joao@example.com',
                role: 'user',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 403,
        description: 'Acesso negado - Você só pode ver seu próprio perfil'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuário não encontrado'
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado'
    })
    findOne(@Param('id') id: string, @Request() req) {
        // Usuário pode ver apenas seu próprio perfil, admin pode ver qualquer um
        if (req.user.sub !== id && req.user.role !== 'admin') {
            throw new ForbiddenException('Você só pode visualizar seu próprio perfil');
        }
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Atualizar usuário',
        description: 'Atualiza dados de um usuário. Usuários podem editar apenas seu próprio perfil. Admins podem editar qualquer perfil.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID do usuário (MongoDB ObjectId)',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'Usuário atualizado com sucesso'
    })
    @ApiResponse({
        status: 403,
        description: 'Acesso negado - Você só pode editar seu próprio perfil'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuário não encontrado'
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado'
    })
    update(
        @Param('id') id: string,
        @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
        @Request() req,
    ) {
        // Usuário pode editar apenas seu próprio perfil, admin pode editar qualquer um
        if (req.user.sub !== id && req.user.role !== 'admin') {
            throw new ForbiddenException('Você só pode editar seu próprio perfil');
        }
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Deletar usuário (ADMIN)',
        description: 'Remove um usuário do sistema. APENAS ADMINISTRADORES podem deletar usuários.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID do usuário (MongoDB ObjectId)',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuário deletado com sucesso'
    })
    @ApiResponse({
        status: 403,
        description: 'Acesso negado - Apenas administradores'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuário não encontrado'
    })
    @ApiResponse({
        status: 401,
        description: 'Não autorizado'
    })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
