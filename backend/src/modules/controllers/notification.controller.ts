import { Request, Response } from 'express';
import Notification from '../models/notification.model';
import { ChannelService } from '../channels/channel.service';
import { NotificationFactory } from '../factories/notification.factory';

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
  
        if (!subject || !message || !channels?.length) {
            res.status(400).json({ 
                message: 'Subject, message, and channels are required',
                details: {
                    received: {
                        subject: Boolean(subject),
                        message: Boolean(message),
                        channels: channels?.length || 0
                    }
                }
            });
            return;  
        }
  
        const newNotification = await Notification.create({ 
            subject,
            message, 
            channels,
            status: 'pending'  
        });
  
        const activeChannels = (await ChannelService.getChannels())
            .filter(c => c.isActive && channels.includes(c.name)) 
            .map(c => c.name);
  
        const results = await Promise.all(
            activeChannels.map(async (channel) => {
                try {
                    const sender = NotificationFactory.createSender(channel);
                    await sender.send(message);  
                    return { channel, status: 'sent' as const };  
                } catch (error) {
                    const errorMessage = error || 'Unknown error';
                    console.error(`Error sending to ${channel}:`, errorMessage);
                    return { 
                        channel, 
                        status: 'failed' as const, 
                        error: errorMessage 
                    };  
                }
            })
        );
  
        const allSent = results.every(r => r.status === 'sent');  
        newNotification.status = allSent ? 'sent' : 'failed';
        await newNotification.save();  
  
        res.status(201).json({
            notification: newNotification,
            results,
            success: allSent
        });
  
    } catch (error) {
        const errorMessage = error || 'Failed to send notification';
        console.error('Error in sendNotification:', errorMessage);
        res.status(500).json({ 
            message: 'Failed to send notification',
            error: errorMessage
        });
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
  

  