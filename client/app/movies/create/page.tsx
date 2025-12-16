'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_MOVIE, GET_GENRES, GET_MOVIES } from '@/lib/graphql';
import { useRouter } from 'next/navigation';
import { Genre } from '@/types';
import Link from 'next/link';

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
    <div className="container-smooth section-padding min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Хлебные крошки */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-sm text-foreground/60">
            <Link href="/" className="hover:text-primary transition-colors">Каталог</Link>
            <span className="text-foreground/30">/</span>
            <span className="text-primary font-medium">Добавить фильм</span>
          </div>
        </div>

        <div className="glass-card p-10 border border-border/50 shadow-glow animate-slide-down">
          {/* Заголовок с иконкой */}
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-inner-orange">
              <span className="text-white text-3xl">🎬</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Добавить новый фильм</h1>
              <p className="text-foreground/70">Заполните информацию о фильме, чтобы добавить его в каталог</p>
            </div>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="glass-card border border-red-500/30 p-6 mb-8 animate-shake">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">!</span>
                </div>
                <div>
                  <p className="font-bold text-red-400 mb-1 text-lg">Ошибка создания</p>
                  <p className="text-foreground/70">{error.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Название */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-foreground/90">
                <span className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                  Название фильма *
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input-field text-lg py-4 focus:border-primary focus:shadow-glow"
                placeholder="Введите название фильма"
              />
            </div>

            {/* Описание */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-foreground/90">
                <span className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  Описание *
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="input-field min-h-[180px] text-lg py-4 resize-y focus:border-primary focus:shadow-glow"
                placeholder="Опишите сюжет фильма, основные моменты и почему его стоит посмотреть"
                rows={5}
              />
              <div className="flex justify-end mt-2">
                <span className={`text-sm ${description.length > 1000 ? 'text-red-400' : 'text-foreground/50'}`}>
                  {description.length}/1000 символов
                </span>
              </div>
            </div>

            {/* Год и длительность */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-semibold mb-4 text-foreground/90">
                  <span className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    Год выпуска *
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    className="input-field text-lg py-4 focus:border-primary focus:shadow-glow"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/40">
                    год
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4 text-foreground/90">
                  <span className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    Длительность *
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                    min="1"
                    className="input-field text-lg py-4 focus:border-primary focus:shadow-glow"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/40">
                    минут
                  </div>
                </div>
              </div>
            </div>

            {/* Жанры */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-foreground/90">
                <span className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                  Жанры * (выберите один или несколько)
                </span>
                <span className="text-sm text-foreground/60 font-normal mt-1">
                  Выбрано: {selectedGenres.length} {selectedGenres.length === 1 ? 'жанр' : 
                    selectedGenres.length % 10 >= 2 && selectedGenres.length % 10 <= 4 ? 'жанра' : 'жанров'}
                </span>
              </label>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {genres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      className={`px-6 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                          : 'bg-secondary-light border border-border text-foreground/80 hover:border-primary/40 hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="text-yellow-300 animate-pulse">✓</span>
                        )}
                        <span className="font-medium">{genre.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {selectedGenres.length === 0 && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl animate-pulse">
                  <p className="text-red-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    Пожалуйста, выберите хотя бы один жанр
                  </p>
                </div>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-border/50">
              <button
                type="submit"
                disabled={loading || selectedGenres.length === 0}
                className="btn-primary flex-1 py-4 text-lg font-semibold shadow-glow hover:shadow-glow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Создание фильма...</span>
                  </div>
                ) : (
                  <>
                    <span>Добавить фильм</span>
                    <span className="ml-2 text-xl">🎬</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary py-4 text-lg font-semibold flex-1"
              >
                <span>Отмена</span>
                <span className="ml-2">←</span>
              </button>
            </div>
          </form>

          {/* Информационная панель */}
          <div className="glass-card p-6 mt-10 border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-lg">💡</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-foreground/90">Советы по добавлению фильма</h3>
                <ul className="space-y-2 text-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>Укажите точное название фильма и год выпуска</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2"></span>
                    <span>Добавьте подробное описание сюжета</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>Выберите все подходящие жанры</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}