// src/routes/notification.routes.ts
import { Router } from 'express';
import {
    getNotifications,
    sendNotification,
    getChannels,
    toggleChannel,
    getNotificationHistory
} from '../controllers/notification.controller';
import { validateRequestStrict } from '../middlewares/validateRequest';
import { body, param } from 'express-validator';

const router = Router();

router.get('/notifications', getNotifications);

router.post('/notifications',
    [
        body('message').isString().notEmpty().withMessage('Message is required'),
        body('subject').isString().notEmpty().withMessage('Subject is required'),
        body('channels').isArray({ min: 1 }).withMessage('At least one channel is required'),
        body('channels.*').isIn(['email', 'sms', 'push']).withMessage('Invalid channel type')
    ],
    validateRequestStrict,
    sendNotification
);

router.get('/channels', getChannels);

router.get('/notifications/history', getNotificationHistory); 

router.put('/channels/:name',
    [
        param('name').isIn(['email', 'sms', 'push']).withMessage('Invalid channel name')
    ],
    validateRequestStrict, 
    toggleChannel
);

export default router;
