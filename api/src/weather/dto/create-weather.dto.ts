import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeatherDto {
    @ApiProperty({ example: 28.5, description: 'Temperatura em graus Celsius' })
    @IsNumber()
    @IsNotEmpty()
    temperature: number;

    @ApiProperty({ example: 65, description: 'Umidade relativa (%)' })
    @IsNumber()
    @IsNotEmpty()
    humidity: number;

    @ApiProperty({ example: 0, description: 'Precipitação (mm)' })
    @IsNumber()
    @IsNotEmpty()
    precipitation: number;

    @ApiProperty({ example: 12.5, description: 'Velocidade do vento (km/h)' })
    @IsNumber()
    @IsNotEmpty()
    windSpeed: number;

    @ApiProperty({ example: 1, description: 'Código do clima (WMO)' })
    @IsNumber()
    @IsNotEmpty()
    weatherCode: number;
}