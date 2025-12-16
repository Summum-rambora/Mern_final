'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ALL_USERS, GET_MOVIES, DELETE_USER, RESTORE_USER, DELETE_MOVIE, RESTORE_MOVIE } from '../../lib/graphql';
import AdminOnly from '../../components/AdminOnly';

type TabType = 'users' | 'movies';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [userSearch, setUserSearch] = useState('');
  const [movieSearch, setMovieSearch] = useState('');

  // Запрос данных
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(GET_ALL_USERS, {
    skip: activeTab !== 'users',
  });

  const { data: moviesData, loading: moviesLoading, refetch: refetchMovies } = useQuery(GET_MOVIES, {
    skip: activeTab !== 'movies',
  });

  // Мутации для пользователей
  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted: () => {
      alert('Пользователь удален');
      refetchUsers();
    },
    onError: (error) => alert(`Ошибка: ${error.message}`),
  });

  const [restoreUser] = useMutation(RESTORE_USER, {
    onCompleted: () => {
      alert('Пользователь восстановлен');
      refetchUsers();
    },
    onError: (error) => alert(`Ошибка: ${error.message}`),
  });

  // Мутации для фильмов
  const [deleteMovie] = useMutation(DELETE_MOVIE, {
    onCompleted: () => {
      alert('Фильм удален');
      refetchMovies();
    },
    onError: (error) => alert(`Ошибка: ${error.message}`),
  });

  const [restoreMovie] = useMutation(RESTORE_MOVIE, {
    onCompleted: () => {
      alert('Фильм восстановлен');
      refetchMovies();
    },
    onError: (error) => alert(`Ошибка: ${error.message}`),
  });

  // Обработчики
  const handleDeleteUser = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      deleteUser({ variables: { id } });
    }
  };

  const handleRestoreUser = (id: string) => {
    restoreUser({ variables: { id } });
  };

  const handleDeleteMovie = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
      deleteMovie({ variables: { id } });
    }
  };

  const handleRestoreMovie = (id: string) => {
    restoreMovie({ variables: { id } });
  };

  // Фильтрация
  const filteredUsers = usersData?.allUsers?.filter((user: any) =>
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredMovies = moviesData?.movies?.filter((movie: any) =>
    movie.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
    movie.description.toLowerCase().includes(movieSearch.toLowerCase())
  );

  return (
    <AdminOnly>
      <div className="min-h-screen bg-secondary pt-24 pb-12">
        <div className="container-smooth max-w-7xl mx-auto">
          
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Панель администратора</h1>
            <p className="text-foreground/60">Управление пользователями и фильмами</p>
          </div>

          {/* Табы */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-secondary-light text-foreground/70 hover:text-foreground hover:bg-secondary-light/80'
              }`}
            >
              👥 Пользователи
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'movies'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-secondary-light text-foreground/70 hover:text-foreground hover:bg-secondary-light/80'
              }`}
            >
              🎬 Фильмы
            </button>
          </div>

          {/* Контент */}
          <div className="bg-secondary-light/50 rounded-2xl border border-border/50 p-6">
            
            {/* Пользователи */}
            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Управление пользователями</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Поиск пользователей..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/50 focus:border-blue-500/50 focus:outline-none w-full md:w-64"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40">🔍</span>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers?.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-secondary border border-border/30 hover:border-border/50 transition-all"
                      >
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            user.role === 'ADMIN'
                              ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-400/40'
                              : 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400/40'
                          }`}>
                            <span className={`font-bold ${
                              user.role === 'ADMIN' ? 'text-purple-400' : 'text-blue-400'
                            }`}>
                              {user.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-foreground">{user.username}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                user.role === 'ADMIN'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {user.role === 'ADMIN' ? 'Админ' : 'Пользователь'}
                              </span>
                              {user.isDeleted && (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                                  Удален
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground/60">{user.email}</p>
                            <p className="text-xs text-foreground/40 mt-1">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {!user.isDeleted ? (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all text-sm font-medium"
                            >
                              Удалить
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreUser(user.id)}
                              className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 transition-all text-sm font-medium"
                            >
                              Восстановить
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!usersLoading && filteredUsers?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/10 border-2 border-blue-500/20 flex items-center justify-center">
                      <span className="text-3xl text-blue-400">👤</span>
                    </div>
                    <p className="text-foreground/60">Пользователи не найдены</p>
                  </div>
                )}
              </div>
            )}

            {/* Фильмы */}
            {activeTab === 'movies' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Управление фильмами</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Поиск фильмов..."
                      value={movieSearch}
                      onChange={(e) => setMovieSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/50 focus:border-orange-500/50 focus:outline-none w-full md:w-64"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40">🔍</span>
                  </div>
                </div>

                {moviesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-64 bg-secondary rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMovies?.map((movie: any) => (
                      <div
                        key={movie.id}
                        className="bg-secondary border border-border/30 rounded-2xl p-5 hover:border-border/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-foreground text-lg truncate flex-1 mr-4">{movie.title}</h3>
                          {movie.isDeleted && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
                              Удален
                            </span>
                          )}
                        </div>
                        
                        <p className="text-foreground/60 text-sm mb-4 line-clamp-2">{movie.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-foreground/70 text-sm">{movie.releaseYear} год</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="font-semibold">{movie.ratingAvg?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {movie.genres?.slice(0, 2).map((genre: any) => (
                            <span
                              key={genre.id}
                              className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                            >
                              {genre.name}
                            </span>
                          ))}
                          {movie.genres?.length > 2 && (
                            <span className="px-2 py-1 rounded-full text-xs bg-foreground/10 text-foreground/60 border border-foreground/20">
                              +{movie.genres.length - 2}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all text-sm font-medium">
                            Посмотреть
                          </button>
                          {!movie.isDeleted ? (
                            <button
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all text-sm font-medium"
                            >
                              Удалить
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreMovie(movie.id)}
                              className="px-3 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 transition-all text-sm font-medium"
                            >
                              Восстановить
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!moviesLoading && filteredMovies?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-500/10 border-2 border-orange-500/20 flex items-center justify-center">
                      <span className="text-3xl text-orange-400">🎬</span>
                    </div>
                    <p className="text-foreground/60">Фильмы не найдены</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminOnly>
  );
}