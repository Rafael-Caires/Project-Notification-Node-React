import Channel from '../models/channel.model';

export class ChannelService {
    private static availableChannels = ['email', 'sms', 'push']; 
    
    static async initializeChannels() {
        for (const channel of this.availableChannels) {
            await Channel.findOneAndUpdate(
                { name: channel }, 
                { $setOnInsert: { isActive: true } },
                { upsert: true, new: true } 
            );
        }
    }

    static async getChannels() {
        return Channel.find();
    }

    static async toggleChannel(name: string) {
        const channel = await Channel.findOne({ name });
        if (!channel) throw new Error('Channel not found');
        channel.isActive = !channel.isActive; 
        return channel.save();
    }
}