import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNotificationContext } from '../context/NotificationContext';
import { useSocket } from '../hooks/useSocket'; // Importe o hook
const API_URL = import.meta.env.VITE_API_URL;

export const NotificationHistory = () => {
  const { notifications, setNotifications } = useNotificationContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket(); // Agora o hook está disponível

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/notifications/history`);
        const last20Notifications = response.data.slice(0, 20);
        setNotifications(last20Notifications);
        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar as notificações');
        console.error('Erro ao carregar as notificações:', err);
        setLoading(false);
      }
    };

    fetchNotifications();

    // Listener para novas notificações via socket
    if (socket) {
      socket.on('newNotification', fetchNotifications);
      
      return () => {
        socket.off('newNotification', fetchNotifications);
      };
    }
  }, [setNotifications, socket]);

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