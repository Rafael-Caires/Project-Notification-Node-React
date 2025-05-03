import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import './App.css';
import { NotificationForm } from '../src/components/NotificationForm';
import { NotificationHistory } from './components/NotificationHistory';
import { useNotificationContext } from './context/NotificationContext'; // Importando o contexto

const API_URL = import.meta.env.VITE_API_URL;

// Definindo o tipo Channel diretamente
interface Channel {
  name: string;
  isActive: boolean;
}

function App() {
  const { notifications, setNotifications } = useNotificationContext(); // Usando o contexto
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]); // Corrigido o erro do tipo Channel
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'channels' | 'send' | 'history'>('send');

  const reloadNotifications = async () => {
    try {
      console.log("Reloading notifications...");
      const response = await axios.get(`${API_URL}/api/notifications/history`);
      const last20Notifications = response.data.slice(0, 20);
      setNotifications(last20Notifications); // Atualizando o estado global via Context
    } catch (err) {
      setError('Falha ao carregar as notificações');
      console.error('Erro ao carregar as notificações:', err);
    }
  };

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_WS_URL);
  
    socketInstance.on('connect', () => {
      console.log("WebSocket connected!");
      setIsConnected(true);
    });
  
    socketInstance.on('disconnect', () => {
      console.log("WebSocket disconnected.");
      setIsConnected(false);
    });
  
    // Listener para novas notificações
    socketInstance.on('newNotification', (newNotification) => {
      console.log("Nova notificação recebida:", newNotification);
      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
    });
  
    // Listener para atualização de status
    socketInstance.on('notificationStatus', (statusData) => {
      console.log("Status atualizado:", statusData);
      setNotifications(prev => prev.map(notification => 
        notification.subject === statusData.subject ? 
        { ...notification, status: statusData.status } : 
        notification
      ));
    });
  
    // Solicitar atualização do histórico ao conectar
    socketInstance.emit('requestHistoryUpdate');
  
    return () => {
      socketInstance.disconnect();
    };
  }, [setNotifications]);

  useEffect(() => {
    if (activeTab === 'history') {
      reloadNotifications(); // Carregar notificações ao acessar a aba de Histórico
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
            {/* Exibir canais aqui */}
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
