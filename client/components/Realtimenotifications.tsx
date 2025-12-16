'use client';

import { useSubscription } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

const MOVIE_ADDED_SUBSCRIPTION = gql`
  subscription NewMovieNotifications {
    movieAddedToFavoriteGenre {
      id
      title
      description
      releaseYear
      genres {
        id
        name
      }
    }
  }
`;

interface Movie {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  genres: { id: string; name: string }[];
}

export default function RealtimeNotifications() {
  const { isAuthenticated, user } = useAuthStore();
  const [notifications, setNotifications] = useState<Movie[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { data, error } = useSubscription(MOVIE_ADDED_SUBSCRIPTION, {
    skip: !isAuthenticated,
    shouldResubscribe: true,
  });

  useEffect(() => {
    if (data?.movieAddedToFavoriteGenre) {
      const newMovie = data.movieAddedToFavoriteGenre;
      
      setNotifications((prev) => {
        if (prev.some(m => m.id === newMovie.id)) {
          return prev;
        }
        return [newMovie, ...prev].slice(0, 5);
      });
      
      setShowNew(true);
      setIsMinimized(false);

      setTimeout(() => setShowNew(false), 5000);
    }
  }, [data]);

  if (!isAuthenticated || !user?.favoriteGenres?.length) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-16' : 'w-96'}`}>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="glass-card p-4 border border-primary/30 shadow-glow rounded-2xl group relative"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white text-xl">🔔</span>
          </div>
          {notifications.length > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center border-2 border-background">
              <span className="text-white text-xs font-bold">{notifications.length}</span>
            </div>
          )}
        </button>
      ) : (
        <div className="glass-card border border-border/50 shadow-glow rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                  <span className="text-2xl">🔔</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    Новые фильмы
                    {showNew && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold">
                        NEW
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-foreground/60">
                    В ваших любимых жанрах
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsMinimized(true)}
                className="w-8 h-8 rounded-lg hover:bg-secondary-light/50 flex items-center justify-center text-foreground/60 hover:text-foreground"
                title="Свернуть"
              >
                <span className="text-xl">−</span>
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📭</span>
                </div>
                <p className="text-foreground/60 text-sm">Пока нет новых фильмов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((movie, index) => (
                  <Link
                    key={movie.id}
                    href={`/movies/${movie.id}`}
                    onClick={() => setIsMinimized(true)}
                    className={`block glass-card p-4 hover:bg-secondary-light/30 border rounded-xl ${
                      index === 0 && showNew 
                        ? 'bg-primary/5 border-primary/30 shadow-glow' 
                        : 'border-transparent hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary via-accent to-primary-dark flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <span className="text-white text-2xl font-bold opacity-70 relative z-10">
                          {movie.title.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 truncate hover:text-primary">
                          {movie.title}
                        </h4>
                        <p className="text-xs text-foreground/70 line-clamp-2 mb-2">
                          {movie.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-foreground/50 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-primary"></span>
                            {movie.releaseYear}
                          </span>
                          {movie.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre.id}
                              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-foreground/40 text-lg">→</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 pt-3 border-t border-border/50 bg-gradient-to-r from-secondary/30 to-secondary/10">
            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground/50">
                {user.favoriteGenres.length} {
                  user.favoriteGenres.length === 1 ? 'жанр' : 
                  user.favoriteGenres.length % 10 >= 2 && user.favoriteGenres.length % 10 <= 4 ? 'жанра' : 'жанров'
                } отслеживается
              </p>
              {notifications.length > 0 && (
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-foreground/50 hover:text-primary underline"
                >
                  Очистить все
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}