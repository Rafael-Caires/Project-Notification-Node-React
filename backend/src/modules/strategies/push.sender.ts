// backend/src/modules/notifications/strategies/push.sender.ts
import { INotificationSender } from '../interfaces/INotificationSender';

export class PushSender implements INotificationSender {
    async send(message: string) {
        // Implementação real usaria Firebase Cloud Messaging ou similar
        console.log(`Enviando push: ${message}`);
        
        return {
            success: true,
            message: 'Push notification sent to devices'
        };
    }
}