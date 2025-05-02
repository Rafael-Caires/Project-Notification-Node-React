export type Notification = {
    id: string;
    message: string;
    channels: string[];
    status: 'pending' | 'sent' | 'failed';
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Channel = {
    name: string;
    isActive: boolean;
    config?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type NotificationResult = {
    success: boolean;
    channel: string;
    message?: string;
    timestamp: Date;
  };