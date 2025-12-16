import { IResolvers } from '@graphql-tools/utils';
import Review from '../../models/Review';
import Movie from '../../models/Movie';
import { createNotification } from '../../services/notification.service';

export const reviewResolver: IResolvers = {
  Query: {
    reviewsByMovie: async (_: any, { movieId }: { movieId: string }) => {
      const reviews = await Review.find({ movie: movieId, isDeleted: false })
        .populate('user')
        .sort({ createdAt: -1 });
      return reviews;
    }
  },
  Mutation: {
    createReview: async (_: any, { input }: any) => {
      const newReview = await Review.create(input) as any;
      const populatedReview = await newReview.populate('user');

      const reviews = await Review.find({ movie: input.movie, isDeleted: false });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Movie.findByIdAndUpdate(input.movie, { ratingAvg: avg });

      const movie = await Movie.findById(input.movie);

      if (movie) {
        try {
          await createNotification({
            userId: input.user,
            type: 'NEW_REVIEW',
            title: 'Новый отзыв',
            message: `Ваш отзыв на фильм "${movie.title}" был опубликован`,
            payload: JSON.stringify({ 
              movieId: movie._id.toString(), 
              reviewId: newReview._id.toString() 
            })
          });
        } catch (error) {
          console.error('Error creating notification:', error);
          // Продолжаем выполнение, даже если уведомление не создалось
        }
      }

      return populatedReview;
    }
  },
  Review: {
    createdAt: (parent: any) => {
      return parent.createdAt ? parent.createdAt.toISOString() : new Date().toISOString();
    }
  }
};