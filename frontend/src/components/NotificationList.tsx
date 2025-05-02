import { useChannels } from '../hooks/useChannels';

export const ChannelList = () => {
  const { channels, loading, error, toggleChannel } = useChannels();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;
  if (!channels.length) return <div>Nenhum canal encontrado</div>;

  return (
    <div className="channel-list">
      <h2>Canais de Notificação</h2>
      {channels.map((channel) => (
        <div key={channel.name} className="channel-item">
          <p>{channel.name}</p>
          <button onClick={() => toggleChannel(channel.name)}>
            {channel.isActive ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      ))}
    </div>
  );
};
