import { Request, Response } from 'express';
import Notification from '../models/notification.model';
import { ChannelService } from '../channels/channel.service';
import { NotificationFactory } from '../factories/notification.factory';
import { io } from '../../config/server';

interface ErrorWithMessage {
    message: string;
    stack?: string;
}
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
}

function getErrorMessage(error: unknown): string {
    if (isErrorWithMessage(error)) return error.message;
    return 'Unknown error occurred';
}

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error fetching notifications:', errorMessage);
        res.status(500).json({ 
            message: 'Server error',
            error: errorMessage 
        });
    }
};

export const sendNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { subject, message, channels } = req.body;
  
      // Log para verificar o que está sendo recebido na requisição
      console.log('Received notification data:', { subject, message, channels });
  
      if (!subject || !message || !channels?.length) {
        console.log('Validation failed: subject, message, or channels are missing');
        res.status(400).json({
          message: 'Subject, message, and channels are required',
          details: {
            received: {
              subject: Boolean(subject),
              message: Boolean(message),
              channels: channels?.length || 0,
            },
          },
        });
        return;
      }
  
      // Criação da notificação no banco de dados
      const newNotification = await Notification.create({
        subject,
        message,
        channels,
        status: 'pending',
      });
  
      console.log('Notification created:', newNotification);
  
      const activeChannels = (await ChannelService.getChannels())
        .filter((c) => c.isActive && channels.includes(c.name))
        .map((c) => c.name);
  
      console.log('Active channels:', activeChannels);
  
      // Envia a notificação para cada canal ativo
      const results = await Promise.all(
        activeChannels.map(async (channel) => {
          try {
            const sender = NotificationFactory.createSender(channel);
            console.log(`Sending notification to ${channel}...`);
            await sender.send(message);  // Envia a mensagem
  
            // Emite o status de "enviado" para o frontend via WebSocket
            console.log(`Emitting notification status to WebSocket: sent for ${channel}`);
            io.emit('notificationStatus', {
              subject,
              status: 'sent',
              channel,
            });
  
            return { channel, status: 'sent' };
          } catch (error) {
            const errorMessage = error || 'Unknown error';
            console.error(`Error sending notification to ${channel}:`, errorMessage);
  
            // Emite o status de falha para o frontend via WebSocket
            console.log(`Emitting notification status to WebSocket: failed for ${channel}`);
            io.emit('notificationStatus', {
              subject,
              status: 'failed',
              channel,
              error: errorMessage,
            });
  
            return { channel, status: 'failed', error: errorMessage };
          }
        })
      );
  
      const allSent = results.every((r) => r.status === 'sent');
      newNotification.status = allSent ? 'sent' : 'failed';
      await newNotification.save();
  
      console.log('Notification status updated:', newNotification.status);
  
      // Retorna a resposta ao frontend
      res.status(201).json({
        notification: newNotification,
        results,
        success: allSent,
      });
    } catch (error) {
      const errorMessage = error || 'Failed to send notification';
      console.error('Error in sendNotification:', errorMessage);
      res.status(500).json({ message: 'Failed to send notification', error: errorMessage });
    }
  };
  
export const getChannels = async (req: Request, res: Response) => {
  console.log('GET /channels requested');
  try {
      console.log('Fetching channels from service...');
      const channels = await ChannelService.getChannels();
      console.log('Channels found:', channels);
      res.json(channels);
  } catch (error) {
      console.error('Error in GET /channels:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

export const toggleChannel = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const updatedChannel = await ChannelService.toggleChannel(name);
        res.json(updatedChannel);
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error toggling channel:', errorMessage);
        res.status(400).json({ 
            message: 'Failed to toggle channel',
            error: errorMessage,
            details: {
                channel: req.params.name
            }
        });
    }
};

export const getNotificationHistory = async (req: Request, res: Response) => {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })  
        .limit(20)  
        .select('subject message channels createdAt')  
        .lean();  
  
      res.status(200).json(notifications);  
    } catch (error) {
      console.error('Error fetching notification history:', error);
      res.status(500).json({
        message: 'Failed to fetch notification history',
        error: error,
      });
    }
  };
  

  