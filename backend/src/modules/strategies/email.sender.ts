// backend/src/modules/notifications/strategies/email.sender.ts
import { INotificationSender } from '../interfaces/INotificationSender';

export class EmailSender implements INotificationSender {
    async send(message: string) {
        // Implementação real usaria Nodemailer ou serviço de email
        console.log(`Enviando email: ${message}`);
        
        // Simulação de envio
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { 
            success: true,
            message: 'Email enqueued for delivery'
        };
    }
}