import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather } from './entities/weather.entity';

@Injectable()
export class WeatherService {
  
  // Injeção de Dependência do Model do Mongoose
  constructor(@InjectModel(Weather.name) private weatherModel: Model<Weather>) {}

  async create(createWeatherDto: CreateWeatherDto) {
    const createdWeather = new this.weatherModel(createWeatherDto);
    return createdWeather.save();
  }

  findAll() {
    return this.weatherModel.find().exec();
  }

  // Pode apagar os métodos findOne, update e remove por enquanto se quiser
}