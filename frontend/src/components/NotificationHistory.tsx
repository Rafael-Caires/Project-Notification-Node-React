// src/components/NotificationHistory.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Notification {
  subject: string;  // Novo campo de assunto
  message: string;
  channels: string[];
  createdAt: string;
}

export const NotificationHistory = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar o histórico de notificações ao montar o componente
  useEffect(() => {
    axios
      .get('http://localhost:3001/api/notifications/history')  // Substitua pela URL do seu backend
      .then((response) => {
        // Limitando a quantidade de notificações para as últimas 20
        const last20Notifications = response.data.slice(0, 20);
        setNotifications(last20Notifications);  // Atualiza o estado com as últimas 20 notificações
        setLoading(false);
      })
      .catch((err) => {
        setError('Falha ao carregar as notificações');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Carregando notificações...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="notification-history">
      <h2>Histórico de Notificações</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index} className="notification-item">
            <p><strong>Assunto:</strong> {notification.subject}</p> {/* Exibindo o assunto */}
            <p><strong>Mensagem:</strong> {notification.message}</p>
            <p><strong>Canais:</strong> {notification.channels.join(', ')}</p>
            <p><strong>Enviado em:</strong> {new Date(notification.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
