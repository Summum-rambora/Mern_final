'use client';

import { useSubscription } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

const MOVIE_ADDED_SUBSCRIPTION = gql`
  subscription OnMovieAdded {
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
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Movie[]>([]);
  const [showNew, setShowNew] = useState(false);

  const { data } = useSubscription(MOVIE_ADDED_SUBSCRIPTION, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (data?.movieAddedToFavoriteGenre) {
      const newMovie = data.movieAddedToFavoriteGenre;
      setNotifications((prev) => [newMovie, ...prev].slice(0, 5));
      setShowNew(true);


      setTimeout(() => setShowNew(false), 3000);
    }
  }, [data]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="glass-card p-6 border border-border/50 shadow-glow animate-slide-down">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
          <span className="text-2xl">🔔</span>
        </div>
        <div>
          <h3 className="text-xl font-bold">Новые фильмы</h3>
          <p className="text-sm text-foreground/60">
            В ваших любимых жанрах
          </p>
        </div>
        {showNew && (
          <span className="ml-auto px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold animate-pulse">
            NEW
          </span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((movie, index) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className={`block glass-card p-4 hover:bg-secondary-light/30 transition-all duration-300 border border-transparent hover:border-primary/20 ${
              index === 0 && showNew ? 'animate-slide-up bg-primary/5 border-primary/30' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎬</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1 truncate">
                  {movie.title}
                </h4>
                <p className="text-xs text-foreground/70 line-clamp-2 mb-2">
                  {movie.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-foreground/50">{movie.releaseYear}</span>
                  {movie.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-foreground/50 text-center">
          Вы получаете уведомления о новых фильмах в избранных жанрах
        </p>
      </div>
    </div>
  );
}