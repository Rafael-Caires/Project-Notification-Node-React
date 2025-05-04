// src/seed/notifications.seed.ts
import Notification from '../modules/models/notification.model';

export async function seedNotifications() {
    try {
        const count = await Notification.countDocuments();
        
        if (count === 0) {
            await Notification.create([
                {
                    subject: "Bem-vindo",
                    message: "Sistema de notificações inicializado",
                    channels: ["email"],
                    status: "sent"
                }
            ]);
        }
    } catch (error) {
        console.error('❌ Erro ao criar notificação de exemplo:', error);
    }
}