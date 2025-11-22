import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Entity/Schema do Usuário
 * 
 * 📚 SOLID - Single Responsibility Principle (SRP):
 * Esta classe tem UMA única responsabilidade: definir a estrutura
 * dos dados de usuário no MongoDB.
 * 
 * Não contém lógica de negócio, validação de entrada, ou manipulação de dados.
 * Apenas define COMO os dados são armazenados.
 */

@Schema({ timestamps: true }) // Mongoose adiciona createdAt e updatedAt automaticamente
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password?: string; // Sempre será hash, nunca texto puro (opcional para compatibilidade com delete)

    @Prop({ required: false })
    name?: string;

    @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
    role: string;

    // Mongoose adiciona automaticamente se usarmos timestamps: true
    createdAt?: Date;
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * 🔒 Segurança: Remover senha do JSON ao retornar usuário
 * Isso garante que a senha hash nunca seja exposta acidentalmente
 */
UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password; // Remove senha do objeto retornado
        return ret;
    },
});
