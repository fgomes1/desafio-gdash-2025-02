import { Controller, Get, Post, Body } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { WeatherAiService } from './weather.ai.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService, private readonly weatherAiService: WeatherAiService) { }

  // Recebe o dado do Go e Salva
  @Post()
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  // O Frontend vai usar esse aqui para listar tudo
  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @Get('insight')
  async getInsight() {
    // 1. Pega o último registro do banco
    const logs = await this.weatherService.findAll();
    const lastLog = logs[logs.length - 1]; // Pega o último

    if (!lastLog) return { text: 'Sem dados para analisar.' };

    // 2. Manda para a IA
    return this.weatherAiService.generateInsight(lastLog);
  }
}