import { Document, Schema, model } from 'mongoose';

export interface IChannel extends Document {
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
        enum: ['email', 'sms', 'push']
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true,
    autoIndex: true
});


export default model<IChannel>('Channel', channelSchema);