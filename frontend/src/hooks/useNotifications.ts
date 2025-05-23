import { useState, useEffect } from 'react';
import axios from 'axios';
import { Notification } from '../core/types';
import { useNotificationContext } from '../context/NotificationContext';

export const useNotifications = () => {
  const { notifications, setNotifications } = useNotificationContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get<Notification[]>('/api/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return { notifications, loading };
};