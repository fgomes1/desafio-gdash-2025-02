import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/dto/create-user.dto';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        await this.seedDefaultAdmin();
    }

    private async seedDefaultAdmin() {
        try {
            const defaultEmail = this.configService.get<string>('DEFAULT_ADMIN_EMAIL') || 'admin@gdash.com';
            const defaultPassword = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD') || 'admin123';
            const defaultName = this.configService.get<string>('DEFAULT_ADMIN_NAME') || 'Admin GDASH';

            const existingUser = await this.usersService.findByEmail(defaultEmail);

            if (existingUser) {
                this.logger.log(`✅ Usuário admin padrão já existe: ${defaultEmail}`);
                return;
            }

            await this.usersService.create({
                name: defaultName,
                email: defaultEmail,
                password: defaultPassword,
                role: UserRole.ADMIN,
            });

            this.logger.log(`🎉 Usuário admin padrão criado com sucesso!`);
            this.logger.log(`📧 Email: ${defaultEmail}`);
            this.logger.log(`🔑 Senha: ${defaultPassword}`);
            this.logger.warn(`⚠️  IMPORTANTE: Altere a senha padrão em produção!`);
        } catch (error) {
            this.logger.error(`❌ Erro ao criar usuário admin padrão: ${error.message}`);
        }
    }
}
