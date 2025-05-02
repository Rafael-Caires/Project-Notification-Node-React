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

// Adicionando as rotas
router.get('/notifications', getNotifications);

router.post('/notifications',
    [
        // Validando o campo 'message' (mensagem)
        body('message').isString().notEmpty().withMessage('Message is required'),
        
        // Validando o campo 'subject' (assunto)
        body('subject').isString().notEmpty().withMessage('Subject is required'),
        
        // Validando os canais
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
