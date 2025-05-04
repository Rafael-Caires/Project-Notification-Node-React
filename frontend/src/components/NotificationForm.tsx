import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

interface Channel {
  name: string;
  isActive: boolean;
}

export const NotificationForm = () => {
  const [subject, setSubject] = useState(''); 
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/channels`)
      .then((response) => {
        setChannels(response.data);
      })
      .catch((err) => {
        setError('Erro ao buscar os canais');
        console.error(err);
      });
  }, []);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);  
  };

  const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const channelName = e.target.value;
    if (e.target.checked) {
      setSelectedChannels((prevSelected) => [...prevSelected, channelName]);
    } else {
      setSelectedChannels((prevSelected) =>
        prevSelected.filter((channel) => channel !== channelName)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !message || selectedChannels.length === 0) {
      setError('Assunto, mensagem e canais são obrigatórios');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${API_URL}/api/notifications`, {
        subject,  
        message,
        channels: selectedChannels,
      });

      setSuccess('Notificação enviada com sucesso!');
      setSubject('');  
      setMessage('');  
      setSelectedChannels([]);  
    } catch (err: any) {
      // Verificar a estrutura do erro retornado e exibir a mensagem adequada
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Erro ao enviar a notificação');
        console.error(err.response.data);
      } else {
        setError('Erro ao enviar a notificação');
      }
    } finally {
      setIsSending(false);
    }
  };


  return (
    <section className="send-section card">
      <h2>Enviar Notificação</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="notification-form">
        <div className="input-group">
          <label htmlFor="subject">Assunto:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={handleSubjectChange}  
            placeholder="Digite o assunto"
            required
            className="input-text"
          />
        </div>

        <div className="input-group">
          <label htmlFor="message">Mensagem:</label>
          <input
            type="text"
            id="message"
            value={message}
            onChange={handleMessageChange}
            placeholder="Digite sua mensagem"
            required
            className="input-text"
          />
        </div>

        <div className="checkbox-group">
          <label>Selecione os canais:</label>
          {channels.map((channel) => (
            <div key={channel.name} className="checkbox-item">
              <input
                type="checkbox"
                id={channel.name}
                value={channel.name}
                checked={selectedChannels.includes(channel.name)}
                onChange={handleChannelChange}
                className="checkbox-input"
              />
              <label htmlFor={channel.name} className="checkbox-label">{channel.name}</label>
            </div>
          ))}
        </div>

        <button type="submit" className="send-btn" disabled={isSending}>
          {isSending ? 'Enviando...' : 'Enviar Notificação'}
        </button>
      </form>
    </section>
  );
};
