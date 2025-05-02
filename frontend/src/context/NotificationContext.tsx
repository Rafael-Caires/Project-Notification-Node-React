// src/context/NotificationContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Channel {
  name: string;
  isActive: boolean;
}

interface Notification {
  message: string;
  channels: string[];
  createdAt: string;
}

interface NotificationContextProps {
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  notificationHistory: Notification[];
  setNotificationHistory: React.Dispatch<React.SetStateAction<Notification[]>>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedChannels: string[];
  setSelectedChannels: React.Dispatch<React.SetStateAction<string[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<Notification[]>([]);
  const [message, setMessage] = useState<string>('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  return (
    <NotificationContext.Provider value={{
      channels,
      setChannels,
      notificationHistory,
      setNotificationHistory,
      message,
      setMessage,
      selectedChannels,
      setSelectedChannels,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
