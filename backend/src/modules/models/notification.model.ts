import mongoose, { Schema, Document } from 'mongoose';

interface INotification extends Document {
  subject: string;
  message: string;
  channels: string[];
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  subject: { type: String, required: true }, 
  message: { type: String, required: true },
  channels: { type: [String], required: true, enum: ['email', 'sms', 'push'] },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', notificationSchema);