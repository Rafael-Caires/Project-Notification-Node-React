export interface Notification {
    _id: string;
    subject: string;
    message: string;
    status: 'pending' | 'sent' | 'failed';
    channels: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface NotificationHistoryProps {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  }

  export interface Channel {
    name: string;
    isActive: boolean;
  }