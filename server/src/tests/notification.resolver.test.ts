import { notificationResolvers } from '../graphql/resolvers/notification.resolver';
import Notification from '../models/Notification';

// Мокаем модель Notification
jest.mock('../../models/Notification');

const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com'
};

const mockNotification = {
  _id: 'notification123',
  id: 'notification123',
  title: 'Test Notification',
  message: 'This is a test notification',
  userId: mockUser,
  isRead: false,
  isDeleted: false,
  createdAt: new Date(),
  populate: jest.fn().mockReturnThis()
};

describe('notificationResolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    describe('myNotifications', () => {
      it('должен вернуть уведомления пользователя отсортированные по дате', async () => {
        const mockNotifications = [
          { ...mockNotification, _id: '1' },
          { ...mockNotification, _id: '2' }
        ];

        // Настраиваем цепочку вызовов методов
        const mockFind = {
          sort: jest.fn().mockReturnThis(),
          populate: jest.fn().mockResolvedValue(mockNotifications)
        };
        
        (Notification.find as jest.Mock).mockReturnValue(mockFind);

        const result = await notificationResolvers.Query.myNotifications(
          null,
          null,
          { user: mockUser }
        );

        expect(Notification.find).toHaveBeenCalledWith({
          userId: mockUser.id,
          isDeleted: false
        });
        expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockFind.populate).toHaveBeenCalledWith('userId');
        expect(result).toEqual(mockNotifications);
      });

      it('должен выбросить ошибку если пользователь не аутентифицирован', async () => {
        await expect(
          notificationResolvers.Query.myNotifications(null, null, {})
        ).rejects.toThrow('Not authenticated');

        await expect(
          notificationResolvers.Query.myNotifications(null, null, { user: null })
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('unreadNotificationsCount', () => {
      it('должен вернуть количество непрочитанных уведомлений', async () => {
        const expectedCount = 5;
        
        (Notification.countDocuments as jest.Mock).mockResolvedValue(expectedCount);

        const result = await notificationResolvers.Query.unreadNotificationsCount(
          null,
          null,
          { user: mockUser }
        );

        expect(Notification.countDocuments).toHaveBeenCalledWith({
          userId: mockUser.id,
          isRead: false,
          isDeleted: false
        });
        expect(result).toBe(expectedCount);
      });

      it('должен выбросить ошибку если пользователь не аутентифицирован', async () => {
        await expect(
          notificationResolvers.Query.unreadNotificationsCount(null, null, {})
        ).rejects.toThrow('Not authenticated');
      });
    });
  });

  describe('Mutation', () => {
    describe('markNotificationAsRead', () => {
      it('должен отметить уведомление как прочитанное', async () => {
        const updatedNotification = {
          ...mockNotification,
          isRead: true
        };

        (Notification.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedNotification);

        const result = await notificationResolvers.Mutation.markNotificationAsRead(
          null,
          { id: 'notification123' },
          { user: mockUser }
        );

        expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: 'notification123', userId: mockUser.id },
          { isRead: true },
          { new: true }
        );
        expect(result).toEqual(updatedNotification);
      });

      it('должен выбросить ошибку если пользователь не аутентифицирован', async () => {
        await expect(
          notificationResolvers.Mutation.markNotificationAsRead(
            null,
            { id: 'notification123' },
            {}
          )
        ).rejects.toThrow('Not authenticated');
      });

      it('должен выбросить ошибку если уведомление не найдено', async () => {
        (Notification.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

        await expect(
          notificationResolvers.Mutation.markNotificationAsRead(
            null,
            { id: 'nonexistent' },
            { user: mockUser }
          )
        ).rejects.toThrow('Notification not found');
      });
    });

    describe('markAllNotificationsAsRead', () => {
      it('должен отметить все уведомления как прочитанные', async () => {
        (Notification.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 3 });

        const result = await notificationResolvers.Mutation.markAllNotificationsAsRead(
          null,
          null,
          { user: mockUser }
        );

        expect(Notification.updateMany).toHaveBeenCalledWith(
          { userId: mockUser.id, isRead: false },
          { isRead: true }
        );
        expect(result).toBe(true);
      });

      it('должен выбросить ошибку если пользователь не аутентифицирован', async () => {
        await expect(
          notificationResolvers.Mutation.markAllNotificationsAsRead(null, null, {})
        ).rejects.toThrow('Not authenticated');
      });
    });
  });

  describe('Notification', () => {
    describe('user', () => {
      it('должен вернуть пользователя из поля userId', async () => {
        const parent = { userId: mockUser };
        
        const result = await notificationResolvers.Notification.user(parent);

        expect(result).toBe(mockUser);
      });

      it('должен вернуть null если userId отсутствует', async () => {
        const parent = { userId: null };
        
        const result = await notificationResolvers.Notification.user(parent);

        expect(result).toBeNull();
      });
    });
  });
});