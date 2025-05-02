import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import './App.css';
import { NotificationForm } from '../src/components/NotificationForm';
import { NotificationHistory } from './components/NotificationHistory';

interface Channel {
  name: string;
  isActive: boolean;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'channels' | 'send' | 'history'>('send');

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_WS_URL);

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));
    setSocket(socketInstance);

    return () => { socketInstance.disconnect(); };
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/api/channels')
      .then(response => setChannels(response.data))
      .catch(err => {
        setError('Falha ao buscar os canais');
        console.error(err);
      });
  }, []);

  const toggleChannel = (channelName: string) => {
    axios.put(`http://localhost:3001/api/channels/${channelName}`)
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
        <div className="header-content">
          <h1>Central de Notificações</h1>
          <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </div>
        </div>
      </header>

      <div className="tabs-container">
        <nav className="tabs">
          <button 
            className={activeTab === 'channels' ? 'active' : ''}
            onClick={() => setActiveTab('channels')}
          >
            Canais
          </button>
          <button 
            className={activeTab === 'send' ? 'active' : ''}
            onClick={() => setActiveTab('send')}
          >
            Enviar Notificação
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            Histórico
          </button>
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
