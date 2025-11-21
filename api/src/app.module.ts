import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://admin:password123@localhost:27017/weather_db?authSource=admin'),
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
