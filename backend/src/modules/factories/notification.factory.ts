// backend/src/modules/notifications/factories/notification.factory.ts
import { INotificationSender } from '../interfaces/INotificationSender';
import { EmailSender } from '../strategies/email.sender';
import { SmsSender } from '../strategies/sms.sender';
import { PushSender } from '../strategies/push.sender';

export class NotificationFactory {
    // Mapa para armazenar os canais personalizados registrados
    private static customSenders: Record<string, new () => INotificationSender> = {};

    // Método para criar o sender com base no canal
    static createSender(channel: string): INotificationSender {
        // Verificar se o canal foi registrado de forma personalizada
        if (this.customSenders[channel]) {
            return new this.customSenders[channel]();
        }

        // Caso o canal não seja personalizado, usar os canais padrões
        switch (channel) {
            case 'email':
                return new EmailSender();
            case 'sms':
                return new SmsSender();
            case 'push':
                return new PushSender();
            default:
                throw new Error(`Unsupported channel: ${channel}`);
        }
    }

    // Método para registrar novos senders personalizados
    static registerSender(channel: string, senderClass: new () => INotificationSender): void {
        // Armazenar a classe de sender personalizada no mapa
        this.customSenders[channel] = senderClass;
    }
}
