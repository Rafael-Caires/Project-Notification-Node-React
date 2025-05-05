// backend/src/modules/notifications/factories/notification.factory.ts
import { INotificationSender } from '../interfaces/INotificationSender';
import { EmailSender } from '../strategies/email.sender';
import { SmsSender } from '../strategies/sms.sender';
import { PushSender } from '../strategies/push.sender';

export class NotificationFactory {
    private static customSenders: Record<string, new () => INotificationSender> = {};

    static createSender(channel: string): INotificationSender {
        if (this.customSenders[channel]) {
            return new this.customSenders[channel]();
        }

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

    static registerSender(channel: string, senderClass: new () => INotificationSender): void {
        this.customSenders[channel] = senderClass;
    }
}
