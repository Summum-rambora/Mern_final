import Notification from "../../models/Notification";

export const notificationResolvers = {
  Query: {
    myNotifications: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error("Not authenticated");

      return Notification.find({
        userId: user.id,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .populate("userId");
    },

    unreadNotificationsCount: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error("Not authenticated");

      return Notification.countDocuments({
        userId: user.id,
        isRead: false,
        isDeleted: false,
      });
    },
  },

  Mutation: {
    markNotificationAsRead: async (_: any, { id }: any, { user }: any) => {
      if (!user) throw new Error("Not authenticated");

      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: user.id },
        { isRead: true },
        { new: true }
      );

      if (!notification) throw new Error("Notification not found");

      return notification;
    },

    markAllNotificationsAsRead: async (_: any, __: any, { user }: any) => {
      if (!user) throw new Error("Not authenticated");

      await Notification.updateMany(
        { userId: user.id, isRead: false },
        { isRead: true }
      );

      return true;
    },
  },

  Notification: {
    user: async (parent: any) => {
      return parent.userId;
    },
  },
};
