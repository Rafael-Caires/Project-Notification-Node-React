// backend/src/modules/notifications/strategies/sms.sender.ts
import { INotificationSender } from '../interfaces/INotificationSender';

export class SmsSender implements INotificationSender {
    async send(message: string) {
        // Implementação real usaria Twilio ou outro serviço SMS
        console.log(`Enviando SMS: ${message}`);
        
        return {
            success: Math.random() > 0.2, // 80% de chance de sucesso (simulação)
            message: 'SMS processing'
        };
    }
}