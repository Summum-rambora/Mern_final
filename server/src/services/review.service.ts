import Review from '../models/Review';
import Movie from '../models/Movie';

export const createReview = async (input: any) => {
  const review = await Review.create(input);

  // Обновляем средний рейтинг фильма
  const reviews = await Review.find({ movie: input.movie, isDeleted: false });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Movie.findByIdAndUpdate(input.movie, { ratingAvg: avg });

  return review;
};

export const getReviewsByMovie = async (movieId: string) => {
  return await Review.find({ movie: movieId, isDeleted: false }).populate('user');
};
