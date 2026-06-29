import Notification from '../models/Notification.js';
import { sendResponse, sendError } from '../utils/response.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit = 20 } = req.query;
    const filter = { recipient: req.user.id };

    if (unreadOnly === 'true') {
      filter.readAt = null;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      readAt: null,
    });

    return sendResponse(res, 200, {
      success: true,
      data: notifications,
      meta: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await notification.save();
    }

    return sendResponse(res, 200, {
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    return sendResponse(res, 200, {
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
