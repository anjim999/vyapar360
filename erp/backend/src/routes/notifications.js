// src/routes/notifications.js
import express from 'express';
import * as notificationController from '../controllers/notifications/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get("/", notificationController.getNotifications);
router.get("/count", notificationController.getUnreadCount);
router.put("/all/read", notificationController.markAllAsRead);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
