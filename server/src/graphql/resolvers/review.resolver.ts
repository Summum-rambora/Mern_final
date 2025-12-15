import { IResolvers } from '@graphql-tools/utils';
import Review from '../../models/Review';
import Movie from '../../models/Movie';
import { createNotification } from '../../services/notification.service';
import { Document } from 'mongoose';

export const reviewResolver: IResolvers = {
  Query: {
    reviewsByMovie: async (_: any, { movieId }: { movieId: string }) => {
      return await Review.find({ movie: movieId, isDeleted: false }).populate('user');
    }
  },
  Mutation: {
    createReview: async (_: any, { input }: any) => {
      const newReview = await Review.create(input)as any;

      // Обновляем средний рейтинг фильма
      const reviews = await Review.find({ movie: input.movie, isDeleted: false });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Movie.findByIdAndUpdate(input.movie, { ratingAvg: avg });

      // Получаем фильм для уведомления
      const movie = await Movie.findById(input.movie);

      // Создаём уведомление о новом отзыве
      if (movie) {
        await createNotification({
          userId: input.user,
          type: 'NEW_REVIEW',
          title: 'Новый отзыв',
          message: `Ваш отзыв на фильм "${movie.title}" был опубликован`,
          payload: { 
            movieId: movie._id.toString(), 
            reviewId: newReview._id.toString() 
          }
        });
      }

      return newReview;
    }
  }
};