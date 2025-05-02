import { useState, useEffect } from 'react';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';  // Importando o Socket
const API_URL = import.meta.env.VITE_API_URL;

interface Notification {
  subject: string;
  message: string;
  channels: string[];
  createdAt: string;
  status?: string;
}

interface NotificationHistoryProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const NotificationHistory = ({ notifications, setNotifications }: NotificationHistoryProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const socket: Socket = io(import.meta.env.VITE_WS_URL); 

  useEffect(() => {
    axios
      .get(`${API_URL}/api/notifications/history`)
      .then((response) => {
        const last20Notifications = response.data.slice(0, 20);
        setNotifications(last20Notifications);
        console.log("Últimas 20 notificações:", last20Notifications);  
        setLoading(false);
      })
      .catch((err) => {
        setError('Falha ao carregar as notificações');
        console.error('Erro ao carregar as notificações:', err);
        setLoading(false);
      });

    socket.on('notificationStatus', (statusData: { subject: string; status: string; channel: string }) => {
      setNotifications((prevNotifications) => {
        const updatedNotifications = prevNotifications.map((notification) => {
          if (notification.subject === statusData.subject) {
            return { ...notification, status: statusData.status };
          }
          return notification;
        });
        return updatedNotifications;  
      });
    });

    return () => {
      socket.off('notificationStatus');  
    };
  }, [setNotifications]);

  const formatDate = (date: string) => {
    const newDate = new Date(date);
    return newDate.toLocaleString(); 
  };

  if (loading) return <div>Carregando notificações...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="notification-history">
      <h2>Histórico de Notificações</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index} className="notification-item">
            <p><strong>Assunto:</strong> {notification.subject}</p>
            <p><strong>Mensagem:</strong> {notification.message}</p>
            <p><strong>Canais:</strong> {notification.channels.join(', ')}</p>
            <p><strong>Enviado em:</strong> {formatDate(notification.createdAt)}</p>
            {notification.status && (
              <p><strong>Status:</strong> {notification.status}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
