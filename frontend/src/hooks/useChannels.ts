import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotificationContext } from '../context/NotificationContext';
const API_URL = import.meta.env.VITE_API_URL;

export const useChannels = () => {
  const { channels, setChannels } = useNotificationContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/channels`)
      .then((response) => {
        setChannels(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Erro ao carregar os canais');
        setLoading(false);
        console.error(err);
      });
  }, []);

  const toggleChannel = (channelName: string) => {
    axios.put(`${API_URL}/api/channels/${channelName}`)
      .then(() => {
        setChannels((prevChannels) =>
          prevChannels.map((channel) =>
            channel.name === channelName
              ? { ...channel, isActive: !channel.isActive }
              : channel
          )
        );
      })
      .catch((err) => {
        setError('Erro ao atualizar o canal');
        console.error(err);
      });
  };

  return { channels, loading, error, toggleChannel };
};
