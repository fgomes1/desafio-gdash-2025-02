import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { WeatherAiService } from './weather.ai.service';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly weatherAiService: WeatherAiService
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Receber dados climáticos do Worker Go',
    description: 'Endpoint interno usado pelo Worker Go para armazenar dados processados da fila'
  })
  @ApiBody({ type: CreateWeatherDto })
  @ApiResponse({
    status: 201,
    description: 'Dados climáticos armazenados com sucesso',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        temperature: 28.5,
        humidity: 65,
        windSpeed: 12.5,
        precipitation: 0,
        weatherCode: 1,
        location: 'Medianeira/PR',
        collectedAt: '2025-01-01T12:00:00.000Z',
        createdAt: '2025-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os dados climáticos',
    description: 'Retorna histórico completo de dados climáticos coletados'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de dados climáticos',
    schema: {
      example: [{
        _id: '507f1f77bcf86cd799439011',
        temperature: 28.5,
        humidity: 65,
        windSpeed: 12.5,
        precipitation: 0,
        weatherCode: 1,
        location: 'Medianeira/PR',
        collectedAt: '2025-01-01T12:00:00.000Z',
        createdAt: '2025-01-01T12:00:00.000Z'
      }]
    }
  })
  findAll() {
    return this.weatherService.findAll();
  }

  @Get('insight')
  @ApiOperation({
    summary: 'Obter insight climático gerado por IA',
    description: 'Gera análise e recomendações baseadas nos dados climáticos mais recentes usando IA (Gemini)'
  })
  @ApiResponse({
    status: 200,
    description: 'Insight gerado com sucesso',
    schema: {
      example: {
        text: 'O dia está ensolarado e agradável com 28°C. Ótimo para atividades ao ar livre! Aproveite para visitar os parques de Medianeira.'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Sem dados disponíveis',
    schema: {
      example: {
        text: 'Sem dados para analisar.'
      }
    }
  })
  async getInsight() {
    const logs = await this.weatherService.findAll();
    const lastLog = logs[logs.length - 1];

    if (!lastLog) return { text: 'Sem dados para analisar.' };

    return this.weatherAiService.generateInsight(lastLog);
  }
}