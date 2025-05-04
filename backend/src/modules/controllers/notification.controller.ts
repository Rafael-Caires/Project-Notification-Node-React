import { Request, Response } from 'express';
import Notification from '../models/notification.model';
import { ChannelService } from '../channels/channel.service';
import { NotificationFactory } from '../factories/notification.factory';
import { IChannel } from '../models/channel.model';
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

    if (!subject?.trim() || !message?.trim() || !Array.isArray(channels) || channels.length === 0) {
      console.warn('Falha na validação - campos obrigatórios ausentes', { subject, message, channels });
      res.status(400).json({
        error: 'ENTRADA_INVÁLIDA',
        message: 'Assunto, mensagem e pelo menos um canal são obrigatórios',
        details: {
          subject_valid: Boolean(subject?.trim()),
          message_valid: Boolean(message?.trim()),
          channels_valid: Array.isArray(channels) && channels.length > 0
        }
      });
      return;
    }

    const availableChannels = await ChannelService.getActiveChannels();
    const activeChannelNames = availableChannels.map((c: IChannel) => c.name);

    const invalidChannels = channels.filter((ch: string) => !activeChannelNames.includes(ch));
    if (invalidChannels.length > 0) {
      console.warn('Tentativa de usar canais inválidos/inativos', { invalidChannels, activeChannelNames });
      res.status(400).json({
        error: 'CANAIS_INVÁLIDOS',
        message: 'Um ou mais canais são inválidos ou inativos',
        invalidChannels,
        availableChannels: activeChannelNames
      });
      return;
    }

    const newNotification = await Notification.create({
      subject,
      message,
      channels,
      status: 'pending',
    });

    io.emit('newNotification', newNotification);

    const activeChannels = (await ChannelService.getChannels())
      .filter((c) => c.isActive && channels.includes(c.name))
      .map((c) => c.name);


    const results = await Promise.all(
      activeChannels.map(async (channel) => {
        try {
          const sender = NotificationFactory.createSender(channel);
          await sender.send(message);

          io.emit('notificationStatus', {
            subject,
            status: 'sent',
            channel,
          });

          return { channel, status: 'sent' };
        } catch (error) {
          const errorMessage = error || 'Erro desconhecido';
          console.error(`Erro ao enviar notificação para ${channel}:`, errorMessage);

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


    res.status(201).json({
      notification: newNotification,
      results,
      success: allSent,
    });
  } catch (error) {
    const errorMessage = error || 'Falha ao enviar a notificação';
    console.error('Erro em sendNotification:', errorMessage);
    res.status(500).json({ message: 'Falha ao enviar a notificação', error: errorMessage });
  }
};

export const getChannels = async (req: Request, res: Response) => {
  try {
      const channels = await ChannelService.getChannels();
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
  

  