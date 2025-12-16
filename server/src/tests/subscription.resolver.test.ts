import { subscriptionResolver } from '../graphql/resolvers/subscription.resolver';
import User from '../models/User';
import { pubsub, NEW_MOVIE_IN_GENRE } from '../pubsub';
import { withFilter } from 'graphql-subscriptions';

// Мокаем зависимости
jest.mock('../../models/User');
jest.mock('../../pubsub');
jest.mock('graphql-subscriptions');

const mockUser = {
  _id: 'user123',
  id: 'user123',
  favoriteGenres: ['genre1', 'genre2']
};

const mockPayload = {
  genreId: 'genre1',
  movieAddedToFavoriteGenre: {
    id: 'movie123',
    title: 'Test Movie',
    year: 2023
  }
};

describe('subscriptionResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Subscription.movieAddedToFavoriteGenre', () => {
    describe('subscribe', () => {
      it('должен создать подписку с правильными параметрами', () => {
        // Arrange
        const mockAsyncIterator = {
          [Symbol.asyncIterator]: () => ({})
        };
        (pubsub.asyncIterableIterator as jest.Mock).mockReturnValue(mockAsyncIterator);
        
        // Act
        const subscribeFn = subscriptionResolver.Subscription.movieAddedToFavoriteGenre.subscribe;
        
        // Assert
        expect(withFilter).toHaveBeenCalled();
        
        // Получаем аргументы, переданные в withFilter
        const [subscribeFunction, filterFunction] = (withFilter as jest.Mock).mock.calls[0];
        
        // Проверяем функцию подписки
        expect(subscribeFunction).toBeInstanceOf(Function);
        
        // Вызываем функцию подписки
        const result = subscribeFunction();
        expect(result).toBe(mockAsyncIterator);
        expect(pubsub.asyncIterableIterator).toHaveBeenCalledWith(NEW_MOVIE_IN_GENRE);
      });
    });

    describe('filter function', () => {
      let filterFunction: any;

      beforeEach(() => {
        // Получаем filter function из withFilter
        (withFilter as jest.Mock).mockImplementation((subscribeFn, filterFn) => {
          filterFunction = filterFn;
          return subscribeFn;
        });
        
        // Инициализируем подписку чтобы withFilter был вызван
        subscriptionResolver.Subscription.movieAddedToFavoriteGenre.subscribe;
      });

      it('должен вернуть true если пользователь имеет жанр в избранном', async () => {
        // Arrange
        const context = { user: { id: 'user123' } };
        (User.findById as jest.Mock).mockResolvedValue({
          ...mockUser,
          favoriteGenres: ['genre1', 'genre2']
        });

        // Act
        const result = await filterFunction(mockPayload, {}, context);

        // Assert
        expect(User.findById).toHaveBeenCalledWith('user123');
        expect(result).toBe(true);
      });

      it('должен вернуть false если пользователь не имеет жанр в избранном', async () => {
        // Arrange
        const context = { user: { id: 'user123' } };
        (User.findById as jest.Mock).mockResolvedValue({
          ...mockUser,
          favoriteGenres: ['genre3', 'genre4'] // Другие жанры
        });

        // Act
        const result = await filterFunction(mockPayload, {}, context);

        // Assert
        expect(result).toBe(false);
      });

      it('должен вернуть false если пользователь не найден в контексте', async () => {
        // Act
        const result = await filterFunction(mockPayload, {}, {});

        // Assert
        expect(result).toBe(false);
        expect(User.findById).not.toHaveBeenCalled();
      });

      it('должен вернуть false если пользователь не найден в базе данных', async () => {
        // Arrange
        const context = { user: { id: 'nonexistent' } };
        (User.findById as jest.Mock).mockResolvedValue(null);

        // Act
        const result = await filterFunction(mockPayload, {}, context);

        // Assert
        expect(result).toBe(false);
      });

      it('должен корректно обрабатывать ObjectId преобразование', async () => {
        // Arrange
        const context = { user: { id: 'user123' } };
        const userWithObjectIds = {
          ...mockUser,
          favoriteGenres: [{ toString: () => 'genre1' }, { toString: () => 'genre2' }]
        };
        (User.findById as jest.Mock).mockResolvedValue(userWithObjectIds);

        const payloadWithObjectId = {
          ...mockPayload,
          genreId: { toString: () => 'genre1' }
        };

        // Act
        const result = await filterFunction(payloadWithObjectId, {}, context);

        // Assert
        expect(result).toBe(true);
      });

      it('должен обрабатывать ошибки при поиске пользователя', async () => {
        // Arrange
        const context = { user: { id: 'user123' } };
        const dbError = new Error('Database error');
        (User.findById as jest.Mock).mockRejectedValue(dbError);

        // Act
        const result = await filterFunction(mockPayload, {}, context);

        // Assert
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith('❌ Error in filter:', dbError);
      });

      it('должен правильно работать с пустым массивом избранных жанров', async () => {
        // Arrange
        const context = { user: { id: 'user123' } };
        (User.findById as jest.Mock).mockResolvedValue({
          ...mockUser,
          favoriteGenres: []
        });

        // Act
        const result = await filterFunction(mockPayload, {}, context);

        // Assert
        expect(result).toBe(false);
      });

      it('должен корректно обрабатывать жанр как строку или ObjectId', async () => {
        // Arrange
        const context = { user: { id: 'user123' } };
        
        const testCases = [
          { favoriteGenres: ['genre1'], genreId: 'genre1', expected: true },
          { favoriteGenres: [{ toString: () => 'genre1' }], genreId: 'genre1', expected: true },
          { favoriteGenres: ['genre1'], genreId: { toString: () => 'genre1' }, expected: true },
          { favoriteGenres: [{ toString: () => 'genre1' }], genreId: { toString: () => 'genre1' }, expected: true }
        ];

        for (const testCase of testCases) {
          (User.findById as jest.Mock).mockResolvedValue({
            ...mockUser,
            favoriteGenres: testCase.favoriteGenres
          });

          const payload = {
            ...mockPayload,
            genreId: testCase.genreId
          };

          // Act
          const result = await filterFunction(payload, {}, context);

          // Assert
          expect(result).toBe(testCase.expected);
        }
      });
    });

    describe('resolve', () => {
      it('должен возвращать movieAddedToFavoriteGenre из payload', () => {
        // Arrange
        const resolveFn = subscriptionResolver.Subscription.movieAddedToFavoriteGenre.resolve;
        
        // Act
        const result = resolveFn(mockPayload);
        
        // Assert
        expect(result).toBe(mockPayload.movieAddedToFavoriteGenre);
      });

      it('должен корректно обрабатывать пустой payload', () => {
        // Arrange
        const resolveFn = subscriptionResolver.Subscription.movieAddedToFavoriteGenre.resolve;
        
        // Act
        const result = resolveFn({});
        
        // Assert
        expect(result).toBeUndefined();
      });

      it('должен логировать при разрешении', () => {
        // Arrange
        const resolveFn = subscriptionResolver.Subscription.movieAddedToFavoriteGenre.resolve;
        
        // Act
        resolveFn(mockPayload);
        
        // Assert
        expect(console.log).toHaveBeenCalledWith('\n🎬 SUBSCRIPTION RESOLVE - Sending movie to client');
        expect(console.log).toHaveBeenCalledWith('Movie:', 'Test Movie');
      });
    });
  });
});