'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MOVIE, GET_REVIEWS_BY_MOVIE, CREATE_REVIEW } from '@/lib/graphql';
import { useParams } from 'next/navigation';
import { Movie, Review } from '@/types';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';

export default function MoviePage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: movieData, loading: movieLoading } = useQuery(GET_MOVIE, {
    variables: { id },
  });

  const { data: reviewsData, loading: reviewsLoading, refetch } = useQuery(GET_REVIEWS_BY_MOVIE, {
    variables: { movieId: id },
  });

  const [createReview, { loading: createLoading }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      setRating(5);
      setComment('');
      refetch();
    },
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await createReview({
      variables: {
        input: {
          user: user.id,
          movie: id,
          rating,
          comment,
        },
      },
    });
  };

  if (movieLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const movie: Movie = movieData?.movie;
  const reviews: Review[] = reviewsData?.reviewsByMovie || [];

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Фильм не найден</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Movie Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white text-9xl font-bold opacity-30">
            {movie.title.charAt(0)}
          </span>
        </div>
        
        <div className="p-6">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          
          <div className="flex items-center gap-4 mb-4 text-gray-600 dark:text-gray-400">
            <span>{movie.releaseYear}</span>
            <span>•</span>
            <span>{movie.duration} минут</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold text-black dark:text-white">
                {movie.ratingAvg.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {movie.genres.map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {movie.description}
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Отзывы ({reviews.length})</h2>

        {/* Add Review Form */}
        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Оставить отзыв</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Рейтинг: {rating}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Комментарий
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                rows={4}
                placeholder="Поделитесь своим мнением о фильме..."
              />
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {createLoading ? 'Отправка...' : 'Отправить отзыв'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Отзывов пока нет. Будьте первым!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{review.user.username}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold">{review.rating}/10</span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}