// src/channels/channel.service.ts
import Channel from '../models/channel.model';
import { IChannel } from '../models/channel.model';

export class ChannelService {
    private static readonly DEFAULT_CHANNELS = ['email', 'sms', 'push'] as const;
    private static readonly CHANNEL_STATUS = {
        ACTIVE: true,
        INACTIVE: false
    };

    static async initializeDefaultChannels(): Promise<IChannel[]> {
        try {
            const operations = this.DEFAULT_CHANNELS.map(channelName => 
                Channel.findOneAndUpdate(
                    { name: channelName },
                    { 
                        $setOnInsert: { 
                            isActive: this.CHANNEL_STATUS.ACTIVE 
                        } 
                    },
                    { 
                        upsert: true, 
                        new: true,
                        setDefaultsOnInsert: true 
                    }
                )
            );

            const results = await Promise.all(operations);
            return results.filter(channel => channel !== null) as IChannel[];
        } catch (error) {
            console.error('Failed to initialize default channels:', error);
            throw new Error('Channel initialization failed');
        }
    }

    static async getChannels(activeOnly: boolean = false): Promise<IChannel[]> {
        try {
            const query = activeOnly ? { isActive: true } : {};
            return await Channel.find(query)
                .sort({ name: 1 })
                .lean<IChannel[]>();
        } catch (error) {
            console.error('Error fetching channels:', error);
            throw new Error('Failed to retrieve channels');
        }
    }

    static async getActiveChannels(): Promise<IChannel[]> {
        return this.getChannels(true);
    }

    static async toggleChannel(name: string): Promise<IChannel> {
        try {
            const channel = await Channel.findOne({ name });
            
            if (!channel) {
                throw new Error(`Channel '${name}' not found`);
            }

            channel.isActive = !channel.isActive;
            const updatedChannel = await channel.save();
            
            return updatedChannel;
        } catch (error) {
            console.error(`Error toggling channel '${name}':`, error);
            throw error;
        }
    }

    static async isChannelActive(name: string): Promise<boolean> {
        try {
            const channel = await Channel.findOne({ 
                name, 
                isActive: true 
            });
            return !!channel;
        } catch (error) {
            console.error(`Error checking channel '${name}' status:`, error);
            return false;
        }
    }

    static async bulkUpdateChannels(channels: Array<{
        name: string;
        isActive: boolean;
    }>): Promise<number> {
        try {
            const bulkOps = channels.map(({ name, isActive }) => ({
                updateOne: {
                    filter: { name },
                    update: { $set: { isActive } },
                    upsert: true
                }
            }));

            const result = await Channel.bulkWrite(bulkOps);
            return result.modifiedCount + result.upsertedCount;
        } catch (error) {
            console.error('Error in bulk channel update:', error);
            throw new Error('Bulk update failed');
        }
    }
}