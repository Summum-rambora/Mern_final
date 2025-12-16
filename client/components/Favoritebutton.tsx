'use client';

import { useMutation } from '@apollo/client/react';
import { TOGGLE_FAVORITE_MOVIE, GET_ME } from '@/lib/graphql';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';

interface FavoriteButtonProps {
  movieId: string;
  isFavorite: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({ movieId, isFavorite: initialIsFavorite, size = 'md' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const [toggleFavorite, { loading }] = useMutation(TOGGLE_FAVORITE_MOVIE, {
    refetchQueries: [{ query: GET_ME }],
    onCompleted: () => {
      setIsFavorite(!isFavorite);
    },
  });

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    await toggleFavorite({
      variables: { movieId },
    });
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        transition-colors duration-200
        ${
          isFavorite
            ? 'bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-secondary-light text-foreground/60 hover:bg-secondary border border-border/50 hover:border-primary/30'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <span>
          {isFavorite ? '❤️' : '🤍'}
        </span>
      )}
    </button>
  );
}