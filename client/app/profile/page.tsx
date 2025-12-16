'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ME, GET_GENRES, TOGGLE_FAVORITE_GENRE } from '@/lib/graphql';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Genre } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser, hydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  const { data, loading, refetch } = useQuery(GET_ME, {
    skip: !isAuthenticated || !hydrated,
    fetchPolicy: 'network-only',
  });

  const { data: genresData } = useQuery(GET_GENRES);

  const [toggleFavoriteGenre, { loading: toggleLoading }] = useMutation(TOGGLE_FAVORITE_GENRE, {
    refetchQueries: [GET_ME],
    onCompleted: (data) => {
      
      if (data?.toggleFavoriteGenre) {
        setUser(data.toggleFavoriteGenre);
      }
      
      refetch();
    },
    onError: (error) => {
      console.error('Error toggling favorite genre:', error);
    }
  });

  useEffect(() => {
    if (!hydrated) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router, hydrated]);

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data, setUser]);

  if (!hydrated || loading) {
    return (
      <div className="container-smooth section-padding">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-[4px] border-transparent border-t-primary border-r-accent"></div>
            <div className="absolute inset-4 animate-ping rounded-full border-2 border-primary/20"></div>
          </div>
          <p className="text-foreground/70 text-xl font-semibold animate-pulse">Загрузка профиля...</p>
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

  if (!user) {
    return null;
  }

  const allGenres: Genre[] = genresData?.genres || [];
  const favoriteGenreIds = user.favoriteGenres?.map((g) => g.id) || [];

  const handleToggleGenre = async (genreId: string) => {
    try {
      await toggleFavoriteGenre({
        variables: { genreId },
      });
    } catch (error) {
      console.error('Failed to toggle genre:', error);
    }
  };

  return (
    <div className="container-smooth section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Карточка пользователя */}
        <div className="glass-card p-8 mb-10 border border-primary/20 shadow-glow animate-slide-down">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
            {/* Аватар */}
            
            
            {/* Информация */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    {user.username}
                  </h1>
                  <p className="text-foreground/70 text-lg">{user.email}</p>
                </div>
                
                <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/30 font-semibold text-sm">
                  {user.role}
                </span>
              </div>
              
              {/* Статистика */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center border border-border/30">
                  <p className="text-2xl font-bold gradient-text mb-1">
                    {user.favoriteMovies?.length || 0}
                  </p>
                  <p className="text-sm text-foreground/60">Избранных фильмов</p>
                </div>
                <div className="glass-card p-4 text-center border border-border/30">
                  <p className="text-2xl font-bold gradient-text mb-1">
                    {user.favoriteGenres?.length || 0}
                  </p>
                  <p className="text-sm text-foreground/60">Любимых жанров</p>
                </div>
                <div className="glass-card p-4 text-center border border-border/30">
                  <p className="text-2xl font-bold gradient-text mb-1">
                    {user.reviews?.length || 0}
                  </p>
                  <p className="text-sm text-foreground/60">Написанных отзывов</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Акцентная линия */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 via-40% to-transparent"></div>
        </div>

        {/* Любимые жанры */}
        <div className="glass-card p-8 mb-10 border border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
              <span className="text-primary text-2xl">🎭</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Любимые жанры</h2>
              <p className="text-foreground/70">
                Выберите жанры, чтобы получать персонализированные рекомендации
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            {allGenres.map((genre) => {
              const isFavorite = favoriteGenreIds.includes(genre.id);
              
              return (
                <button
                  key={genre.id}
                  onClick={() => handleToggleGenre(genre.id)}
                  disabled={toggleLoading}
                  className={`px-6 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFavorite
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-primary/40'
                      : 'bg-secondary-light border border-border text-foreground/80 hover:border-primary/40 hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isFavorite && (
                      <span className="text-yellow-300 animate-pulse">★</span>
                    )}
                    <span className="font-medium">{genre.name}</span>
                    {!isFavorite && (
                      <span className="text-foreground/40 text-sm">+</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {user.favoriteGenres && user.favoriteGenres.length > 0 && (
            <div className="glass-card p-5 border border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-primary mb-1">
                    Вы подписаны на {user.favoriteGenres.length} {
                      user.favoriteGenres.length === 1 ? 'жанр' : 'жанра'
                    }
                  </p>
                  <p className="text-foreground/70 text-sm">
                    Вы будете получать рекомендации и уведомления о новых фильмах в этих жанрах!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Избранные фильмы */}
        <div className="glass-card p-8 border border-border/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
              <span className="text-primary text-2xl">🎬</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Избранные фильмы</h2>
              <p className="text-foreground/70">
                Фильмы, которые вы добавили в избранное
              </p>
            </div>
          </div>
          
          {user.favoriteMovies && user.favoriteMovies.length > 0 ? (
            <div className="space-y-4">
              {user.favoriteMovies.map((movie, index) => (
                <a
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group glass-card p-5 flex items-center justify-between hover-lift border border-transparent hover:border-primary/20 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-primary text-xl">🎥</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
                        {movie.title}
                      </h3>
                      <p className="text-foreground/60 text-sm">
                        {movie.releaseYear} • {movie.duration} мин
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold text-sm">{movie.ratingAvg.toFixed(1)}</span>
                    </div>
                    <span className="text-foreground/40 group-hover:text-primary transition-colors duration-300">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-primary/50">📽️</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground/90">
                У вас пока нет избранных фильмов
              </h3>
              <p className="text-foreground/70 mb-8 max-w-md mx-auto">
                Открывайте новые фильмы и добавляйте их в избранное, чтобы вернуться к ним позже
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary px-8 py-3.5 text-lg"
              >
                Перейти в каталог
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}