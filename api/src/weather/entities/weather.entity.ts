import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true }) // Cria created_at e updated_at automático
export class Weather {
  @Prop()
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  precipitation: number;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);