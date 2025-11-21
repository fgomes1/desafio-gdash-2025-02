import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true })
export class Weather {
  @Prop()
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  precipitation: number;

  @Prop()
  windSpeed: number;

  @Prop()
  weatherCode: number;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);