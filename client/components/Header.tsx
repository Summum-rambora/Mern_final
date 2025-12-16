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
    <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-xl border-b border-border/50 shadow-glow">
      <nav className="container-smooth py-3">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-inner-orange">
                <span className="text-white text-3xl font-bold">🎬</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-0 group-hover:opacity-30 blur-md transition-all duration-500"></div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#FF5722] via-[#FF9800] to-[#FF5722] bg-clip-text text-transparent">
                CinemaHub
              </span>
              <span className="text-xs text-foreground/60 font-medium tracking-wide">Фильмы & Сериалы</span>
            </div>
          </Link>

          {/* Навигация */}
          <div className="flex items-center">
            {/* Каталог */}
            <div className="mr-6">
              <Link
                href="/"
                className="relative text-foreground/80 hover:text-primary transition-all duration-300 group"
              >
                <span className="text-base font-medium px-4 py-2.5 rounded-xl hover:bg-secondary-light/30 transition-all duration-300">
                  Каталог
                </span>
                <span className="absolute -bottom-1 left-4 right-4 w-auto h-[2px] bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"></span>
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center">
                {/* Добавить фильм */}
                <div className="mr-8">
                  <Link
                    href="/movies/create"
                    className="relative text-foreground/80 hover:text-primary transition-all duration-300 group"
                  >
                    <span className="text-base font-medium px-4 py-2.5 rounded-xl hover:bg-secondary-light/30 transition-all duration-300">
                      Добавить фильм
                    </span>
                    <span className="absolute -bottom-1 left-4 right-4 w-auto h-[2px] bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"></span>
                  </Link>
                </div>
                
                {/* Профиль */}
                <div className="mr-8">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-foreground/80 hover:text-primary transition-all duration-300 group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center group-hover:border-primary/50 transition-all duration-300 shadow-inner-orange">
                        <span className="text-primary font-bold text-base">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-all duration-300"></div>
                    </div>
                    <span className="text-base font-medium">Профиль</span>
                  </Link>
                </div>
                
                {/* Выйти */}
                <button
                  onClick={logout}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600/90 to-red-500/90 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-red-500/30"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                {/* Войти */}
                <div className="mr-8">
                  <Link
                    href="/auth/login"
                    className="relative text-foreground/80 hover:text-primary transition-all duration-300 group"
                  >
                    <span className="text-base font-medium px-4 py-2.5 rounded-xl hover:bg-secondary-light/30 transition-all duration-300">
                      Войти
                    </span>
                    <span className="absolute -bottom-1 left-4 right-4 w-auto h-[2px] bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"></span>
                  </Link>
                </div>
                
                {/* Регистрация */}
                <Link
                  href="/auth/register"
                  className="btn-primary shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5 active:translate-y-0 px-8 py-3 text-base font-semibold"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Акцентная линия */}
        <div className="mt-1 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 via-30% to-transparent"></div>
      </nav>
    </header>
  );
}