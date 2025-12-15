'use client';

import { useQuery } from '@apollo/client/react';
import { GET_MOVIES } from '@/lib/graphql';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';

export default function Home() {
  const { data, loading, error } = useQuery(GET_MOVIES);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка фильмов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <p className="font-bold">Ошибка загрузки</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  const movies: Movie[] = data?.movies || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Каталог фильмов</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Найдено фильмов: {movies.length}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Фильмы не найдены
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Попробуйте добавить первый фильм в каталог
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}