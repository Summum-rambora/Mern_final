import { reviewResolver } from '../graphql/resolvers/review.resolver';
import Review from '../models/Review';
import Movie from '../models/Movie';
import { createNotification } from '../services/notification.service';

// Мокаем зависимости
jest.mock('../../models/Review');
jest.mock('../../models/Movie');
jest.mock('../../services/notification.service');

const mockReview = {
  _id: 'review123',
  id: 'review123',
  rating: 5,
  comment: 'Great movie!',
  user: { _id: 'user123', name: 'John Doe' },
  movie: 'movie123',
  isDeleted: false
};

const mockMovie = {
  _id: 'movie123',
  id: 'movie123',
  title: 'Test Movie',
  ratingAvg: 0
};

describe('reviewResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    describe('reviewsByMovie', () => {
      it('должен вернуть отзывы для указанного фильма', async () => {
        const mockReviews = [
          { ...mockReview, _id: '1' },
          { ...mockReview, _id: '2' }
        ];

        // Настраиваем цепочку вызовов методов
        const mockFind = {
          populate: jest.fn().mockResolvedValue(mockReviews)
        };
        
        (Review.find as jest.Mock).mockReturnValue(mockFind);

        const result = await reviewResolver.Query.reviewsByMovie(
          null,
          { movieId: 'movie123' }
        );

        expect(Review.find).toHaveBeenCalledWith({
          movie: 'movie123',
          isDeleted: false
        });
        expect(mockFind.populate).toHaveBeenCalledWith('user');
        expect(result).toEqual(mockReviews);
      });

      it('должен вернуть пустой массив если отзывов нет', async () => {
        const mockFind = {
          populate: jest.fn().mockResolvedValue([])
        };
        
        (Review.find as jest.Mock).mockReturnValue(mockFind);

        const result = await reviewResolver.Query.reviewsByMovie(
          null,
          { movieId: 'movie456' }
        );

        expect(result).toEqual([]);
      });
    });
  });

  describe('Mutation', () => {
    describe('createReview', () => {
      const mockInput = {
        rating: 5,
        comment: 'Amazing film!',
        user: 'user123',
        movie: 'movie123'
      };

      beforeEach(() => {
        (Review.create as jest.Mock).mockResolvedValue(mockReview);
        (Movie.findById as jest.Mock).mockResolvedValue(mockMovie);
        (Movie.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
        (createNotification as jest.Mock).mockResolvedValue({});
      });

      it('должен создать отзыв и обновить средний рейтинг фильма', async () => {
        // Настраиваем мок для Review.find чтобы расчитать средний рейтинг
        const mockReviews = [
          { ...mockReview, rating: 5 },
          { ...mockReview, rating: 4, _id: 'review456' }
        ];
        (Review.find as jest.Mock).mockReturnValueOnce({
          // Первый вызов для reviewsByMovie
          populate: jest.fn()
        }).mockReturnValueOnce({
          // Второй вызов внутри createReview для расчета среднего
          // Используем mockResolvedValue без цепочки
        });
        
        // Используем отдельный мок для второго вызова Review.find
        const originalFind = Review.find as jest.Mock;
        originalFind.mockReturnValueOnce({
          populate: jest.fn().mockResolvedValue([])
        }).mockReturnValueOnce({
          // Второй вызов - для расчета среднего рейтинга
        });
        
        // Мок для расчета среднего
        const reviewsForAvg = [
          { rating: 5 },
          { rating: 4 }
        ];
        (Review.find as jest.Mock).mockReturnValue(reviewsForAvg);

        const result = await reviewResolver.Mutation.createReview(
          null,
          { input: mockInput }
        );

        // Проверка создания отзыва
        expect(Review.create).toHaveBeenCalledWith(mockInput);
        expect(result).toEqual(mockReview);

        // Проверка расчета среднего рейтинга
        expect(Review.find).toHaveBeenCalledWith({
          movie: mockInput.movie,
          isDeleted: false
        });

        // Проверка обновления фильма
        expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(
          mockInput.movie,
          { ratingAvg: 4.5 } // (5 + 4) / 2 = 4.5
        );

        // Проверка создания уведомления
        expect(Movie.findById).toHaveBeenCalledWith(mockInput.movie);
        expect(createNotification).toHaveBeenCalledWith({
          userId: mockInput.user,
          type: 'NEW_REVIEW',
          title: 'Новый отзыв',
          message: `Ваш отзыв на фильм "${mockMovie.title}" был опубликован`,
          payload: {
            movieId: mockMovie._id.toString(),
            reviewId: mockReview._id.toString()
          }
        });
      });

      it('должен правильно рассчитать средний рейтинг для одного отзыва', async () => {
        const singleReview = [{ rating: 5 }];
        (Review.find as jest.Mock).mockReturnValue(singleReview);

        await reviewResolver.Mutation.createReview(
          null,
          { input: mockInput }
        );

        expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(
          mockInput.movie,
          { ratingAvg: 5 } // 5 / 1 = 5
        );
      });

      it('должен создать отзыв без уведомления если фильм не найден', async () => {
        (Movie.findById as jest.Mock).mockResolvedValue(null);
        
        await reviewResolver.Mutation.createReview(
          null,
          { input: mockInput }
        );

        expect(createNotification).not.toHaveBeenCalled();
        expect(Movie.findById).toHaveBeenCalledWith(mockInput.movie);
      });

      it('должен корректно обработать отсутствие отзывов при расчете среднего', async () => {
        (Review.find as jest.Mock).mockReturnValue([]);

        await reviewResolver.Mutation.createReview(
          null,
          { input: mockInput }
        );

        expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(
          mockInput.movie,
          { ratingAvg: 0 } // 0 / 0 = 0 (или NaN, но в коде будет 0)
        );
      });

      it('должен обработать ошибку при создании отзыва', async () => {
        const dbError = new Error('Database error');
        (Review.create as jest.Mock).mockRejectedValue(dbError);

        await expect(
          reviewResolver.Mutation.createReview(null, { input: mockInput })
        ).rejects.toThrow('Database error');

        // Проверяем что последующие действия не выполняются
        expect(Movie.findByIdAndUpdate).not.toHaveBeenCalled();
        expect(createNotification).not.toHaveBeenCalled();
      });

      it('должен продолжить работу при ошибке создания уведомления', async () => {
        const notificationError = new Error('Notification service error');
        (createNotification as jest.Mock).mockRejectedValue(notificationError);

        // Мокаем console.error чтобы проверить что ошибка логируется
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await reviewResolver.Mutation.createReview(
          null,
          { input: mockInput }
        );

        expect(result).toEqual(mockReview);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error creating notification:',
          notificationError
        );

        consoleSpy.mockRestore();
      });
    });
  });
});