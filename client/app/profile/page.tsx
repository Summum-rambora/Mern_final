'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ME, GET_GENRES, TOGGLE_FAVORITE_GENRE } from '@/lib/graphql';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Genre } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuthStore();

  const { data, loading, refetch } = useQuery(GET_ME, {
    skip: !isAuthenticated,
  });

  const { data: genresData } = useQuery(GET_GENRES);

  const [toggleFavoriteGenre] = useMutation(TOGGLE_FAVORITE_GENRE, {
    onCompleted: (data) => {
      setUser(data.toggleFavoriteGenre);
      refetch();
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data, setUser]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
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
    await toggleFavoriteGenre({
      variables: { genreId },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Favorite Genres Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Любимые жанры</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Выберите жанры, чтобы получать уведомления о новых фильмах
          </p>

          <div className="flex flex-wrap gap-3">
            {allGenres.map((genre) => {
              const isFavorite = favoriteGenreIds.includes(genre.id);
              
              return (
                <button
                  key={genre.id}
                  onClick={() => handleToggleGenre(genre.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    isFavorite
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {isFavorite && '★ '}
                  {genre.name}
                </button>
              );
            })}
          </div>

          {user.favoriteGenres && user.favoriteGenres.length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                ✓ Вы подписаны на {user.favoriteGenres.length} {
                  user.favoriteGenres.length === 1 ? 'жанр' : 'жанра'
                }. 
                Вы будете получать уведомления о новых фильмах в этих жанрах!
              </p>
            </div>
          )}
        </div>

        {/* Favorite Movies Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Избранные фильмы</h2>
          
          {user.favoriteMovies && user.favoriteMovies.length > 0 ? (
            <div className="space-y-2">
              {user.favoriteMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <a href={`/movies/${movie.id}`} className="font-medium hover:text-purple-600">
                    {movie.title}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              У вас пока нет избранных фильмов
            </p>
          )}
        </div>
      </div>
    </div>
  );
}