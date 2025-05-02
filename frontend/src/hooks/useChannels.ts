import { useState, useEffect } from 'react';
import axios from 'axios';

export const useChannels = () => {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Busca os canais da API
    axios.get('http://localhost:3001/api/channels')
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

  // Função para alternar o estado do canal (ativar/desativar)
  const toggleChannel = (channelName: string) => {
    axios.put(`http://localhost:3001/api/channels/${channelName}`)
      .then(() => {
        // Atualiza o estado com o canal alterado
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
