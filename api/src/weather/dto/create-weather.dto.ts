import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeatherDto {
    @ApiProperty({ example: 28.5, description: 'Temperatura em graus Celsius' })
    @IsNumber()
    @IsNotEmpty()
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
}