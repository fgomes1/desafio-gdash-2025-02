import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { WeatherModule } from '../weather/weather.module';

@Module({
    imports: [
        ConfigModule,
        WeatherModule,
    ],
    controllers: [PokemonController],
    providers: [PokemonService],
    exports: [PokemonService],
})
export class PokemonModule { }
