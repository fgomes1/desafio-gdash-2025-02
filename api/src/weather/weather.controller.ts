import { Controller, Get, Post, Body, Res, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { WeatherAiService } from './weather.ai.service';
import { ExportService } from './export.service';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly weatherAiService: WeatherAiService,
    private readonly exportService: ExportService,
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

  @Get('classify')
  @ApiOperation({
    summary: 'Classificar clima atual com Pokémons',
    description: 'Classifica o clima atual (frio, quente, agradável, chuvoso, etc.) e sugere Pokémons que combinam'
  })
  @ApiResponse({
    status: 200,
    description: 'Classificação do clima com Pokémons',
    schema: {
      example: {
        classification: 'muito quente',
        emoji: '🔥',
        description: 'Muito calor! Hidrate-se bastante.',
        pokemon: [
          { name: 'Charizard', type: 'fire', id: 6 },
          { name: 'Flareon', type: 'fire', id: 136 },
          { name: 'Arcanine', type: 'fire', id: 59 }
        ],
        weather: {
          temperature: 35,
          precipitation: 0,
          windSpeed: 5,
          condition: 'muito quente'
        }
      }
    }
  })
  async classifyWeather() {
    const logs = await this.weatherService.findAll();
    const lastLog = logs[logs.length - 1];

    if (!lastLog) {
      return {
        classification: 'desconhecido',
        emoji: '❓',
        description: 'Sem dados climáticos disponíveis.',
        pokemon: [],
        weather: null,
      };
    }

    return this.weatherAiService.classifyWeather(lastLog);
  }


  @Get('export/csv')
  @ApiOperation({
    summary: 'Exportar dados climáticos em CSV',
    description: 'Baixa dados climáticos em formato CSV. Use o parâmetro "days" para filtrar por período (padrão: 30 dias)'
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo CSV gerado com sucesso',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  async exportCSV(
    @Query('days') days: number = 30,
    @Res() res: Response
  ) {
    const data = await this.weatherService.findByDateRange(Number(days));
    const csv = await this.exportService.generateCSV(data);

    const filename = `weather-data-${days}days-${new Date().toISOString().split('T')[0]}.csv`;

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': csv.length,
    });

    res.status(HttpStatus.OK).send(csv);
  }

  @Get('export/xlsx')
  @ApiOperation({
    summary: 'Exportar dados climáticos em XLSX',
    description: 'Baixa dados climáticos em formato Excel (.xlsx). Use o parâmetro "days" para filtrar por período (padrão: 30 dias)'
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo XLSX gerado com sucesso',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  async exportXLSX(
    @Query('days') days: number = 30,
    @Res() res: Response
  ) {
    const data = await this.weatherService.findByDateRange(Number(days));
    const xlsx = await this.exportService.generateXLSX(data);

    const filename = `weather-data-${days}days-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': xlsx.length,
    });

    res.status(HttpStatus.OK).send(xlsx);
  }
}