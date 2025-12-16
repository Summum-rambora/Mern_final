'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MOVIE, GET_REVIEWS_BY_MOVIE, CREATE_REVIEW } from '@/lib/graphql';
import { useParams } from 'next/navigation';
import { Movie, Review } from '@/types';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import Link from 'next/link';

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
      <div className="container-smooth section-padding">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-[4px] border-transparent border-t-primary border-r-accent"></div>
            <div className="absolute inset-4 animate-ping rounded-full border-2 border-primary/20"></div>
          </div>
          <p className="text-foreground/70 text-xl font-semibold animate-pulse">Загрузка фильма...</p>
          <div className="mt-6 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const movie: Movie = movieData?.movie;
  const reviews: Review[] = reviewsData?.reviewsByMovie || [];

  if (!movie) {
    return (
      <div className="container-smooth section-padding">
        <div className="text-center py-20">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-8">
            <span className="text-6xl text-primary/50">🎬</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Фильм не найден</h1>
          <p className="text-foreground/70 mb-8 max-w-md mx-auto">
            Возможно, фильм был удален или вы указали неверный адрес
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            <span>←</span>
            <span>Вернуться в каталог</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-smooth section-padding">
      {/* Хлебные крошки */}
      <div className="mb-8">
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <Link href="/" className="hover:text-primary transition-colors">Каталог</Link>
          <span className="text-foreground/30">/</span>
          <span className="text-primary font-medium">{movie.title}</span>
        </div>
      </div>

      {/* Основная информация о фильме */}
      <div className="glass-card overflow-hidden mb-10 border border-border/50 shadow-glow animate-slide-down">
        <div className="h-80 bg-gradient-to-br from-primary via-accent to-primary-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40"></div>
          <span className="absolute text-white text-9xl font-bold opacity-20 left-10 top-10">
            {movie.title.charAt(0)}
          </span>
          
          {/* Рейтинг на изображении */}
          <div className="absolute top-6 right-6">
            <div className="glass-card bg-black/60 backdrop-blur-sm px-6 py-3 rounded-2xl border border-primary/30">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-2xl">★</span>
                <span className="text-3xl font-bold text-white">{movie.ratingAvg.toFixed(1)}</span>
                <span className="text-white/70 text-lg">/10</span>
              </div>
            </div>
          </div>
          
          {/* Информация в оверлее */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/80 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">{movie.releaseYear}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span className="text-lg">{movie.duration} минут</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-lg">{reviews.length} отзывов</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-gradient-to-b from-secondary/50 to-secondary/30">
          {/* Жанры */}
          <div className="flex flex-wrap gap-3 mb-8">
            {movie.genres.map((genre, index) => (
              <span
                key={genre.id}
                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                  index % 2 === 0
                    ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/30'
                    : 'bg-gradient-to-r from-accent/10 to-accent/5 text-accent border border-accent/30'
                }`}
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Описание */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></span>
              Описание
            </h2>
            <p className="text-foreground/80 leading-relaxed text-lg">
              {movie.description}
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-5 text-center border border-border/30">
              <div className="text-3xl font-bold gradient-text mb-2">{movie.ratingAvg.toFixed(1)}</div>
              <div className="text-sm text-foreground/60">Средний рейтинг</div>
            </div>
            <div className="glass-card p-5 text-center border border-border/30">
              <div className="text-3xl font-bold gradient-text mb-2">{reviews.length}</div>
              <div className="text-sm text-foreground/60">Всего отзывов</div>
            </div>
            <div className="glass-card p-5 text-center border border-border/30">
              <div className="text-3xl font-bold gradient-text mb-2">{movie.duration}</div>
              <div className="text-sm text-foreground/60">Длительность (мин)</div>
            </div>
            <div className="glass-card p-5 text-center border border-border/30">
              <div className="text-3xl font-bold gradient-text mb-2">{movie.releaseYear}</div>
              <div className="text-sm text-foreground/60">Год выпуска</div>
            </div>
          </div>
        </div>
      </div>

      {/* Секция отзывов */}
      <div className="glass-card p-8 border border-border/50 animate-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
            <span className="text-primary text-2xl">💬</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">Отзывы и рейтинги</h2>
            <p className="text-foreground/70">
              {reviews.length} {reviews.length === 1 ? 'отзыв' : 
                reviews.length % 10 >= 2 && reviews.length % 10 <= 4 ? 'отзыва' : 'отзывов'}
            </p>
          </div>
        </div>

        {/* Форма добавления отзыва */}
        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="glass-card p-6 mb-10 border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-6 h-1 bg-primary rounded-full"></span>
              Оставить отзыв
            </h3>
            
            {/* Рейтинг */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-foreground/80 font-medium">
                  Ваша оценка: <span className="text-primary font-bold text-xl">{rating}/10</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="text-foreground/60 text-sm">({rating})</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full h-3 bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary [&::-webkit-slider-thumb]:to-accent [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                />
                <div className="flex justify-between text-xs text-foreground/50 mt-2">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* Комментарий */}
            <div className="mb-8">
              <label className="block text-foreground/80 font-medium mb-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Комментарий
                </span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-field min-h-[120px] resize-y focus:border-primary focus:shadow-glow"
                placeholder="Поделитесь своим мнением о фильме..."
                rows={4}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-foreground/50">Ваш отзыв будет виден другим пользователям</span>
                <span className={`text-xs ${comment.length > 500 ? 'text-red-400' : 'text-foreground/50'}`}>
                  {comment.length}/500
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={createLoading || !comment.trim()}
              className="btn-primary px-8 py-3.5 text-lg font-semibold shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Отправка...</span>
                </div>
              ) : (
                'Опубликовать отзыв'
              )}
            </button>
          </form>
        )}

        {/* Список отзывов */}
        {reviewsLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="mt-4 text-foreground/70">Загрузка отзывов...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-primary/50">💭</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground/90">Отзывов пока нет</h3>
            <p className="text-foreground/70 mb-8 max-w-md mx-auto">
              Будьте первым, кто поделится мнением об этом фильме!
            </p>
            {!isAuthenticated && (
              <Link href="/auth/login" className="btn-primary px-8 py-3.5">
                Войти, чтобы оставить отзыв
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="glass-card p-6 border border-border/30 hover:border-primary/20 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                      <span className="text-primary font-bold text-lg">
                        {review.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{review.user.username}</h4>
                      <p className="text-foreground/60 text-sm">
                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass-card px-4 py-2 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-xl">★</span>
                      <span className="font-bold text-lg">{review.rating}</span>
                      <span className="text-foreground/60">/10</span>
                    </div>
                  </div>
                </div>
                
                {review.comment && (
                  <div className="bg-secondary/30 p-5 rounded-xl">
                    <p className="text-foreground/80 leading-relaxed">{review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}