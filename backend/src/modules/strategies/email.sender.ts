// backend/src/modules/notifications/strategies/email.sender.ts
import { INotificationSender } from '../interfaces/INotificationSender';

export class EmailSender implements INotificationSender {
    async send(message: string) {
        console.log(`Enviando email: ${message}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { 
            success: true,
            message: 'Email enqueued for delivery'
        };
    }
}