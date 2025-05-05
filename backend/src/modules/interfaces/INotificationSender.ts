// backend/src/modules/notifications/interfaces/INotificationSender.ts
export interface INotificationSender {
    send(notification: string): Promise<{ success: boolean; message?: string }>;

    validateConfig?(config: unknown): boolean;
}
