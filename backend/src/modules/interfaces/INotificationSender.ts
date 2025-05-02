// backend/src/modules/notifications/interfaces/INotificationSender.ts
export interface INotificationSender {
    send(notification: string): Promise<{ success: boolean; message?: string }>;

    // Opcional: método para validar configurações
    validateConfig?(config: unknown): boolean;
}
