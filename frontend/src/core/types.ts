export interface Notification {
    _id: string;
    message: string;
    status: 'pending' | 'sent' | 'failed';
    channels: string[];
    createdAt: string;
    updatedAt: string;
  }