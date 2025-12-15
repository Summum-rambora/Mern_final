'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_MOVIE, GET_GENRES, GET_MOVIES } from '@/lib/graphql';
import { useRouter } from 'next/navigation';
import { Genre } from '@/types';

export default function CreateMoviePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [duration, setDuration] = useState(90);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const { data: genresData } = useQuery(GET_GENRES);
  const genres: Genre[] = genresData?.genres || [];

  const [createMovie, { loading, error }] = useMutation(CREATE_MOVIE, {
    refetchQueries: [{ query: GET_MOVIES }],
    onCompleted: (data) => {
      router.push(`/movies/${data.createMovie.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGenres.length === 0) {
      alert('Выберите хотя бы один жанр');
      return;
    }

    await createMovie({
      variables: {
        input: {
          title,
          description,
          releaseYear,
          duration,
          genres: selectedGenres,
        },
      },
    });
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Добавить фильм</h1>

        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            <p className="font-bold">Ошибка</p>
            <p>{error.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Название фильма *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              placeholder="Введите название"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Описание *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              rows={5}
              placeholder="Опишите сюжет фильма"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Год выпуска *
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
                required
                min="1900"
                max={new Date().getFullYear() + 5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Длительность (минуты) *
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Жанры * (выберите один или несколько)
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedGenres.includes(genre.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать фильм'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}