import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather } from './entities/weather.entity';

@Injectable()
export class WeatherService {

  constructor(@InjectModel(Weather.name) private weatherModel: Model<Weather>) { }

  async create(createWeatherDto: CreateWeatherDto) {
    const createdWeather = new this.weatherModel(createWeatherDto);
    return createdWeather.save();
  }

  findAll() {
    return this.weatherModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByDateRange(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.weatherModel
      .find({
        createdAt: { $gte: startDate }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async count() {
    return this.weatherModel.countDocuments().exec();
  }

  async seedData(data: any[]) {
    return this.weatherModel.insertMany(data);
  }
}