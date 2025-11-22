import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { WeatherService } from '../weather/weather.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('pokemon')
@Controller('pokemon')
export class PokemonController {
    constructor(
        private readonly pokemonService: PokemonService,
        private readonly weatherService: WeatherService,
    ) { }

    @Get('suggest')
    @ApiOperation({
        summary: 'Sugerir Pokémon baseado no clima atual',
        description: 'IA analisa o clima atual e sugere um Pokémon que combine com as condições climáticas e hora do dia. Perfeito para gamificação!'
    })
    @ApiResponse({
        status: 200,
        description: 'Pokémon sugerido com sucesso',
        schema: {
            example: {
                suggestion: {
                    reason: 'Baseado no clima atual (35°C), sugiro um Pokémon do tipo fire!',
                    type: 'fire',
                    weather: {
                        temperature: 35,
                        condition: 'muito quente'
                    }
                },
                pokemon: {
                    id: 6,
                    name: 'charizard',
                    height: 17,
                    weight: 905,
                    types: ['fire', 'flying'],
                    sprites: {
                        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
                        official: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'
                    },
                    stats: [
                        { name: 'hp', value: 78 },
                        { name: 'attack', value: 84 }
                    ]
                }
            }
        }
    })
    async suggestPokemon() {
        const weatherData = await this.weatherService.findAll();
        const latestWeather = weatherData[0];

        if (!latestWeather) {
            throw new Error('Sem dados climáticos disponíveis');
        }

        return this.pokemonService.suggestPokemonByWeather(latestWeather);
    }

    @Get('list')
    @ApiOperation({
        summary: 'Listar Pokémons com paginação',
        description: 'Retorna lista paginada de Pokémons da PokéAPI'
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({
        status: 200,
        description: 'Lista de Pokémons',
        schema: {
            example: {
                data: [
                    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
                    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' }
                ],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 1281,
                    totalPages: 65
                }
            }
        }
    })
    async listPokemon(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.pokemonService.listPokemon(page, limit);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obter detalhes de um Pokémon',
        description: 'Retorna informações completas de um Pokémon específico (por ID ou nome)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID ou nome do Pokémon',
        example: 'pikachu'
    })
    @ApiResponse({
        status: 200,
        description: 'Detalhes do Pokémon',
        schema: {
            example: {
                id: 25,
                name: 'pikachu',
                height: 4,
                weight: 60,
                types: ['electric'],
                sprites: {
                    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
                    front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
                    official: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
                },
                stats: [
                    { name: 'hp', value: 35 },
                    { name: 'attack', value: 55 },
                    { name: 'defense', value: 40 }
                ],
                abilities: ['static', 'lightning-rod']
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Pokémon não encontrado'
    })
    async getPokemonById(@Param('id') id: string) {
        return this.pokemonService.getPokemonById(id);
    }

    @Get('cache/stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Estatísticas do cache (ADMIN)',
        description: 'Retorna métricas de performance do cache (hits, misses, taxa de acerto). Apenas administradores.'
    })
    @ApiResponse({
        status: 200,
        description: 'Estatísticas do cache',
        schema: {
            example: {
                keys: 15,
                hits: 42,
                misses: 10,
                hitRate: '80.77%'
            }
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
    getCacheStats() {
        return this.pokemonService.getCacheStats();
    }

    @Get('cache/clear')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Limpar cache (ADMIN)',
        description: 'Remove todos os itens do cache manualmente. Apenas administradores. Útil para forçar atualização de dados.'
    })
    @ApiResponse({
        status: 200,
        description: 'Cache limpo com sucesso',
        schema: {
            example: {
                message: 'Cache limpo com sucesso'
            }
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
    clearCache() {
        return this.pokemonService.clearCache();
    }
}
