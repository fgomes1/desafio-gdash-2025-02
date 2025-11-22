
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class WeatherAiService {
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

    async generateInsight(weatherData: any) {
        const prompt = `
      Aja como um assistente meteorológico útil e breve.
      Com base nestes dados atuais de Medianeira/PR:
      - Temperatura: ${weatherData.temperature}°C
      - Umidade: ${weatherData.humidity}%
      - Vento: ${weatherData.windSpeed} km/h
      - Chuva: ${weatherData.precipitation} mm
      - Código Clima: ${weatherData.weatherCode}

      Gere um "Insight do Dia" curto (máximo 2 frases) com uma recomendação prática para a pessoa.
      . Responda em Português do Brasil. Também indique o que pode fazer no dia em questão na cidade da pessoa.
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return { text: response.text() };
        } catch (error) {
            console.error('Erro na IA:', error);
            return { text: `⚠️ Erro na IA: ${error instanceof Error ? error.message : String(error)}` };
        }
    }

    classifyWeather(weatherData: any) {
        const temp = weatherData.temperature;
        const precipitation = weatherData.precipitation || 0;
        const windSpeed = weatherData.windSpeed || 0;

        let classification = '';
        let emoji = '';
        let pokemonSuggestions: Array<{ name: string; type: string; id: number }> = [];
        let description = '';

        // Prioridade: Chuva/Tempestade > Temperatura
        if (precipitation > 5 || (precipitation > 0 && windSpeed > 20)) {
            classification = 'tempestade';
            emoji = '⛈️';
            pokemonSuggestions = [
                { name: 'Pikachu', type: 'electric', id: 25 },
                { name: 'Zapdos', type: 'electric', id: 145 },
                { name: 'Raikou', type: 'electric', id: 243 }
            ];
            description = 'Tempestade! Cuidado com raios e ventos fortes.';
        } else if (precipitation > 0) {
            classification = 'chuvoso';
            emoji = '🌧️';
            pokemonSuggestions = [
                { name: 'Squirtle', type: 'water', id: 7 },
                { name: 'Vaporeon', type: 'water', id: 134 },
                { name: 'Gyarados', type: 'water', id: 130 }
            ];
            description = 'Dia chuvoso. Não esqueça o guarda-chuva!';
        } else if (temp > 32) {
            classification = 'muito quente';
            emoji = '🔥';
            pokemonSuggestions = [
                { name: 'Charizard', type: 'fire', id: 6 },
                { name: 'Flareon', type: 'fire', id: 136 },
                { name: 'Arcanine', type: 'fire', id: 59 }
            ];
            description = 'Muito calor! Hidrate-se bastante.';
        } else if (temp > 25) {
            classification = 'quente';
            emoji = '☀️';
            pokemonSuggestions = [
                { name: 'Charmander', type: 'fire', id: 4 },
                { name: 'Vulpix', type: 'fire', id: 37 },
                { name: 'Growlithe', type: 'fire', id: 58 }
            ];
            description = 'Dia quente e ensolarado. Ótimo para atividades ao ar livre!';
        } else if (temp > 18) {
            classification = 'agradável';
            emoji = '🌤️';
            pokemonSuggestions = [
                { name: 'Bulbasaur', type: 'grass', id: 1 },
                { name: 'Eevee', type: 'normal', id: 133 },
                { name: 'Leafeon', type: 'grass', id: 470 }
            ];
            description = 'Clima agradável, perfeito para qualquer atividade!';
        } else if (temp > 10) {
            classification = 'frio';
            emoji = '❄️';
            pokemonSuggestions = [
                { name: 'Glaceon', type: 'ice', id: 471 },
                { name: 'Seel', type: 'water', id: 86 },
                { name: 'Snorunt', type: 'ice', id: 361 }
            ];
            description = 'Dia frio. Vista-se adequadamente!';
        } else {
            classification = 'muito frio';
            emoji = '🧊';
            pokemonSuggestions = [
                { name: 'Articuno', type: 'ice', id: 144 },
                { name: 'Lapras', type: 'ice', id: 131 },
                { name: 'Dewgong', type: 'ice', id: 87 }
            ];
            description = 'Muito frio! Agasalhe-se bem.';
        }

        return {
            classification,
            emoji,
            description,
            pokemon: pokemonSuggestions,
            weather: {
                temperature: temp,
                precipitation,
                windSpeed,
                condition: classification,
            },
        };
    }
}