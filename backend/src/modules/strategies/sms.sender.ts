// backend/src/modules/notifications/strategies/sms.sender.ts
import { INotificationSender } from '../interfaces/INotificationSender';

export class SmsSender implements INotificationSender {
    async send(message: string) {
        console.log(`Enviando SMS: ${message}`);
        
        return {
            success: Math.random() > 0.2, 
            message: 'SMS processing'
        };
    }
}