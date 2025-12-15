import Notification from '../models/Notification';
import { Types } from 'mongoose';

export const createNotification = async (input: any) => {
  const notification = await Notification.create(input);
  return notification;
};

export const getNotificationsByUser = async (userId: string) => {
  return await Notification.find({ 
    userId, 
    isDeleted: false 
  }).sort({ createdAt: -1 });
};

export const markAsRead = async (notificationId: string) => {
  return await Notification.findByIdAndUpdate(
    notificationId, 
    { isRead: true }, 
    { new: true }
  );
};

export const markAllAsRead = async (userId: string) => {
  await Notification.updateMany(
    { userId, isRead: false, isDeleted: false },
    { isRead: true }
  );
  return true;
};

export const deleteNotification = async (notificationId: string) => {
  return await Notification.findByIdAndUpdate(
    notificationId, 
    { isDeleted: true }, 
    { new: true }
  );
};