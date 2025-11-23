import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WeatherService } from '../weather/weather.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const weatherService = app.get(WeatherService);
    const logger = new Logger('WeatherSeed');

    logger.log('🌱 Iniciando seed de dados climáticos...');

    const now = new Date();
    const records: any[] = [];

    // Gerar dados para as últimas 24 horas
    for (let i = 23; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000); // Voltar i horas
        const hour = date.getHours();

        // Simulação de temperatura baseada na hora do dia
        // Mínima às 4h (18°C), Máxima às 14h (32°C)
        let baseTemp = 25;
        if (hour >= 4 && hour <= 14) {
            baseTemp = 18 + ((hour - 4) / 10) * 14; // Sobe de 18 até 32
        } else if (hour > 14) {
            baseTemp = 32 - ((hour - 14) / 10) * 8; // Desce de 32 até 24
        } else {
            baseTemp = 24 - ((hour + 4) / 8) * 6; // Desce de 24 até 18
        }

        // Adicionar variação aleatória pequena
        const temperature = baseTemp + (Math.random() - 0.5) * 2;

        // Umidade inversa à temperatura (aprox)
        const humidity = 80 - (temperature - 18) * 2.5 + (Math.random() - 0.5) * 5;

        // Vento aleatório
        const windSpeed = 5 + Math.random() * 15;

        // Chuva aleatória (pouca chance)
        const precipitation = Math.random() > 0.8 ? Math.random() * 5 : 0;

        // Criar registro usando o model diretamente seria melhor, mas vamos usar o service se possível
        // Como o service geralmente cria com dados atuais, vamos ter que injetar o model ou criar um método específico
        // Para simplificar, vamos usar o create do service e depois atualizar a data no banco, 
        // ou melhor: vamos usar o Mongoose Model diretamente se conseguirmos injetar.

        // Como estamos num script standalone, vamos apenas criar os objetos e salvar
        // Mas o WeatherService.create usa dados da API externa normalmente.
        // Vamos criar um método "createManual" no WeatherService temporariamente ou usar o Model.

        // Abordagem: Vamos usar o WeatherService.create mas passando os dados manuais
        // Precisamos ver a assinatura do create.

        const weatherData = {
            temperature,
            humidity,
            precipitation,
            windSpeed,
            weatherCode: precipitation > 0 ? 61 : (temperature > 30 ? 0 : 1), // 61: rain, 0: clear, 1: cloudy
            location: 'Medianeira/PR',
            collectedAt: date,
        };

        records.push(weatherData);
    }

    // Injetar o Model para salvar com data retroativa
    // Como não temos acesso fácil ao Model aqui sem exportar, vamos usar uma "gambiarra" elegante:
    // Vamos adicionar um método 'seedData' no WeatherService.

    await weatherService.seedData(records);

    logger.log(`✅ ${records.length} registros climáticos criados com sucesso!`);
    await app.close();
}

bootstrap();
