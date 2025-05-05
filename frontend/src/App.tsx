import { useEffect, useState } from 'react';
import { io} from 'socket.io-client';
import axios from 'axios';
import React from 'react'
import { Channel} from '../src/core/types';
import './App.css';
import { NotificationForm } from '../src/components/NotificationForm';
import { NotificationHistory } from './components/NotificationHistory';
import { useNotificationContext } from './context/NotificationContext'; 

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const {  setNotifications } = useNotificationContext(); 
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]); 
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'channels' | 'send' | 'history'>('send');

  const reloadNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/history`);
      const last20Notifications = response.data.slice(0, 20);
      setNotifications(last20Notifications);
    } catch (err) {
      setError('Falha ao carregar as notificações');
      console.error('Erro ao carregar as notificações:', err);
    }
  };

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_WS_URL);
  
    socketInstance.on('connect', () => {
      console.log("WebSocket Conectado!");
      setIsConnected(true);
    });
  
    socketInstance.on('disconnect', () => {
      console.log("WebSocket Desconectado.");
      setIsConnected(false);
    });
  
    socketInstance.on('newNotification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
    });
  
    socketInstance.on('notificationStatus', (statusData) => {
      setNotifications(prev => prev.map(notification => 
        notification.subject === statusData.subject ? 
        { ...notification, status: statusData.status } : 
        notification
      ));
    });
  
    socketInstance.emit('requestHistoryUpdate');
  
    return () => {
      socketInstance.disconnect();
    };
  }, [setNotifications]);

  useEffect(() => {
    if (activeTab === 'history') {
      reloadNotifications();
    }
  }, [activeTab]);

  useEffect(() => {
    axios.get(`${API_URL}/api/channels`)
      .then(response => setChannels(response.data))
      .catch(err => {
        setError('Falha ao buscar os canais');
        console.error(err);
      });
  }, []);

  const toggleChannel = (channelName: string) => {
    axios.put(`${API_URL}/api/channels/${channelName}`)
      .then(() => {
        setChannels(prevChannels =>
          prevChannels.map(channel =>
            channel.name === channelName ? { ...channel, isActive: !channel.isActive } : channel
          )
        );
      })
      .catch(err => {
        setError('Falha ao atualizar o canal');
        console.error(err);
      });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Central de Notificações</h1>
        <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
      </header>

      <div className="tabs-container">
        <nav className="tabs">
          <button onClick={() => setActiveTab('channels')}>Canais</button>
          <button onClick={() => setActiveTab('send')}>Enviar Notificação</button>
          <button onClick={() => setActiveTab('history')}>Histórico</button>
        </nav>
      </div>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}

        {activeTab === 'channels' && (
          <section className="channels-section card">
            <h2>Canais de Notificação</h2>
            <div className="channels-grid">
              {channels.map((channel) => (
                <div key={channel.name} className="channel-card">
                  <div className="channel-name">
                    {channel.name === 'email' && '📧 '}
                    {channel.name === 'sms' && '📱 '}
                    {channel.name === 'push' && '🔔 '}
                    {channel.name.charAt(0).toUpperCase() + channel.name.slice(1)}
                  </div>
                  <button 
                    onClick={() => toggleChannel(channel.name)} 
                    className={`toggle-btn ${channel.isActive ? 'active' : 'inactive'}`}
                  >
                    {channel.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <div className={`status-indicator ${channel.isActive ? 'on' : 'off'}`}>
                    {channel.isActive ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'send' && (
          <section className="send-section card">
            <NotificationForm />
          </section>
        )}

        {activeTab === 'history' && (
          <section className="history-section card">
            <NotificationHistory />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Central de Notificações © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
