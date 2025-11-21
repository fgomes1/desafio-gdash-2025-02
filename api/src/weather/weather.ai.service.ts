
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
        // Montamos um prompt para a IA agir como um meteorologista
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
}