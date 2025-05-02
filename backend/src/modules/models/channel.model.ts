import mongoose, { Schema, Document } from 'mongoose';

interface IChannel extends Document {
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const channelSchema = new Schema<IChannel>({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        enum: ['email', 'sms', 'push']  // Valores permitidos
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true  // Adiciona createdAt e updatedAt automaticamente
});

// Cria o modelo ou usa um existente para evitar OverwriteModelError
export default mongoose.models.Channel || mongoose.model<IChannel>('Channel', channelSchema);