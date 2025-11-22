import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

@Injectable()
export class PokemonService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    async getPokemonById(id: string | number) {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data = response.data;

            return {
                id: data.id,
                name: data.name,
                height: data.height,
                weight: data.weight,
                types: data.types.map((t: any) => t.type.name),
                sprites: {
                    front_default: data.sprites.front_default,
                    front_shiny: data.sprites.front_shiny,
                    official: data.sprites.other['official-artwork'].front_default,
                },
                stats: data.stats.map((s: any) => ({
                    name: s.stat.name,
                    value: s.base_stat,
                })),
                abilities: data.abilities.map((a: any) => a.ability.name),
            };
        } catch (error) {
            throw new Error(`Pokémon não encontrado: ${id}`);
        }
    }

    async suggestPokemonByWeather(weatherData: any) {
        const prompt = `
Você é um especialista em Pokémon e clima.

Dados climáticos atuais:
- Temperatura: ${weatherData.temperature}°C
- Umidade: ${weatherData.humidity}%
- Velocidade do Vento: ${weatherData.windSpeed} km/h
- Precipitação: ${weatherData.precipitation} mm
- Código do Clima: ${weatherData.weatherCode}
- Localização: ${weatherData.location || 'Medianeira/PR'}
- Hora: ${new Date().getHours()}h

Com base nessas condições climáticas e hora do dia, sugira UM tipo de Pokémon que combine com o clima atual.

Regras:
- Muito quente (>30°C) → Tipo Fire (fogo)
- Chuva ou alta umidade → Tipo Water (água)
- Frio (<15°C) → Tipo Ice (gelo)
- Vento forte → Tipo Flying (voador)
- Noite (19h-6h) → Tipo Dark ou Ghost
- Tempestade → Tipo Electric (elétrico)
- Ensolarado e moderado → Tipo Grass ou Normal

Responda APENAS com uma das seguintes palavras (nada mais):
fire, water, grass, electric, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy, normal
        `.trim();

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const pokemonType = response.text().toLowerCase().trim();

            // Busca Pokémons desse tipo
            const typeResponse = await axios.get(`https://pokeapi.co/api/v2/type/${pokemonType}`);
            const pokemonList = typeResponse.data.pokemon;

            // Escolhe um aleatório
            const randomIndex = Math.floor(Math.random() * Math.min(20, pokemonList.length));
            const chosenPokemon = pokemonList[randomIndex].pokemon;

            // Busca detalhes do Pokémon escolhido
            const pokemonDetails = await this.getPokemonById(chosenPokemon.name);

            return {
                suggestion: {
                    reason: `Baseado no clima atual (${weatherData.temperature}°C), sugiro um Pokémon do tipo ${pokemonType}!`,
                    type: pokemonType,
                    weather: {
                        temperature: weatherData.temperature,
                        condition: this.getWeatherCondition(weatherData),
                    },
                },
                pokemon: pokemonDetails,
            };
        } catch (error) {
            console.error('Erro ao sugerir Pokémon:', error);
            // Fallback: retorna Pikachu
            const pikachu = await this.getPokemonById('pikachu');
            return {
                suggestion: {
                    reason: 'Não consegui analisar o clima, mas Pikachu é sempre uma boa escolha!',
                    type: 'electric',
                    weather: {
                        temperature: weatherData.temperature,
                        condition: 'unknown',
                    },
                },
                pokemon: pikachu,
            };
        }
    }

    private getWeatherCondition(data: any): string {
        if (data.precipitation > 0) return 'chuvoso';
        if (data.temperature > 30) return 'muito quente';
        if (data.temperature < 15) return 'frio';
        if (data.windSpeed > 20) return 'ventoso';
        return 'agradável';
    }

    async listPokemon(page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        try {
            const response = await axios.get(
                `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
            );

            const data = response.data;

            return {
                data: data.results,
                pagination: {
                    page,
                    limit,
                    total: data.count,
                    totalPages: Math.ceil(data.count / limit),
                },
            };
        } catch (error) {
            throw new Error('Erro ao buscar lista de Pokémons');
        }
    }
}
