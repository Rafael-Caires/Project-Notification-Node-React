// src/seed/channels.seed.ts
import Channel from '../modules/models/channel.model';

const initialChannels = [
  { name: 'email', isActive: true },
  { name: 'sms', isActive: true },
  { name: 'push', isActive: true }
];

// Exportação nomeada explícita
export async function seedChannels() {
  try {
    
    for (const channel of initialChannels) {
      const exists = await Channel.findOne({ name: channel.name });
      if (!exists) {
        await Channel.create(channel);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar canais:', error);
    throw error;
  }
}

// Exportação padrão adicional (opcional)
export default { seedChannels };