'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ME } from '@/lib/graphql';

export default function Header() {
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const { data } = useQuery(GET_ME, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data, setUser]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            🎬 CinemaApp
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Каталог
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/movies/create"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Добавить фильм
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Профиль
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}