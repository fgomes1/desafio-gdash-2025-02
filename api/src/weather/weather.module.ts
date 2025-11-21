import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { Weather, WeatherSchema } from './entities/weather.entity';
import { WeatherAiService } from './weather.ai.service';

@Module({
  imports: [
    // Registrando a tabela/coleção nesse módulo
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherAiService],
})
export class WeatherModule { }