import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Channel {
  name: string;
  isActive: boolean;
}

interface Notification {
  subject: string;
  message: string;
  channels: string[];
  status?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  addNotification: (notification: Notification) => void;
  updateNotificationStatus: (subject: string, status: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const updateNotificationStatus = (subject: string, status: string) => {
    setNotifications((prevNotifications) => {
      return prevNotifications.map((notification) =>
        notification.subject === subject ? { ...notification, status } : notification
      );
    });
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, channels, setChannels, addNotification, updateNotificationStatus }}>
      {children}
    </NotificationContext.Provider>
  );
};
