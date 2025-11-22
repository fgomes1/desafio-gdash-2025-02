import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        ConfigModule,
        UsersModule,
    ],
    providers: [SeedService],
})
export class SeedModule { }
