'use client';

import { useQuery } from '@apollo/client/react';
import { GET_MOVIES } from '@/lib/graphql';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';

export default function Home() {
  const { data, loading, error } = useQuery(GET_MOVIES);

  if (loading) {
    return (
      <div className="container-smooth section-padding">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-[3px] border-transparent border-t-primary border-r-accent mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-2 border-primary/30"></div>
          </div>
          <p className="text-foreground/70 text-lg font-medium animate-pulse">Загрузка фильмов...</p>
          <div className="mt-8 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-smooth section-padding">
        <div className="glass-card border border-red-500/30 p-8 max-w-2xl mx-auto animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-400">Ошибка загрузки</h2>
              <p className="text-foreground/70 mt-1">Не удалось загрузить фильмы</p>
            </div>
          </div>
          <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 mt-4">
            <p className="text-red-300 font-mono text-sm">{error.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const movies: Movie[] = data?.movies || [];

  return (
    <div className="container-smooth section-padding">
      {/* Хедер с заголовком */}
      <div className="mb-12 animate-slide-down">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Каталог фильмов
            </h1>
            <p className="text-foreground/70 text-lg">
              Откройте для себя лучшие фильмы и сериалы
            </p>
          </div>
          
          <div className="glass-card px-6 py-4 border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-primary text-2xl">🎬</span>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Всего фильмов</p>
                <p className="text-3xl font-bold gradient-text">{movies.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Декоративная линия */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/30 via-40% to-transparent rounded-full"></div>
      </div>

      {/* Контент */}
      {movies.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="glass-card max-w-2xl mx-auto p-12 border border-dashed border-primary/30">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-8">
              <span className="text-5xl text-primary/50">🎥</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground/90">Фильмы не найдены</h2>
            <p className="text-foreground/70 mb-8 max-w-md mx-auto">
              Каталог пуст. Будьте первым, кто добавит фильм!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-secondary px-8 py-3">
                Обновить страницу
              </button>
              <button className="btn-primary px-8 py-3">
                Добавить фильм
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Статистика фильтров (можно добавить позже) */}
          <div className="glass-card mb-8 p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-foreground/70">Сортировка:</span>
              <select className="input-field w-auto bg-secondary-light">
                <option>По популярности</option>
                <option>По рейтингу</option>
                <option>По дате выхода</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground/70">Фильтр по жанрам:</span>
              <select className="input-field w-auto bg-secondary-light">
                <option>Все жанры</option>
                <option>Боевик</option>
                <option>Драма</option>
                <option>Комедия</option>
              </select>
            </div>
          </div>
          
          {/* Сетка фильмов */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
          
          {/* Пагинация/подсказка */}
          <div className="mt-12 pt-8 border-t border-border/50 text-center">
            <p className="text-foreground/60 mb-4">
              Показано {movies.length} из {movies.length} фильмов
            </p>
            <div className="flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-primary' : 'bg-border'} transition-all duration-300`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}