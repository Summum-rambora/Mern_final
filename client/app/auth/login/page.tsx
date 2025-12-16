'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN } from '@/lib/graphql';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loginMutation, { loading, error }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      login(data.login.user, data.login.token);
      router.push('/');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginMutation({
      variables: { email, password },
    });
  };

  return (
    <div className="container-smooth section-padding min-h-screen flex items-center">
      <div className="max-w-lg w-full mx-auto">
        {/* Декоративные элементы */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="glass-card p-10 border border-border/50 shadow-glow animate-slide-up">
          {/* Заголовок с иконкой */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-inner-orange">
              <span className="text-white text-4xl">🔐</span>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-3">Добро пожаловать</h1>
            <p className="text-foreground/70">Войдите в свой аккаунт</p>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="glass-card border border-red-500/30 p-5 mb-8 animate-shake">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">!</span>
                </div>
                <div>
                  <p className="font-bold text-red-400 mb-1">Ошибка входа</p>
                  <p className="text-foreground/70 text-sm">{error.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground/80">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Email адрес
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field focus:border-primary focus:shadow-glow"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground/80">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Пароль
                </span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field focus:border-primary focus:shadow-glow"
                placeholder="••••••••"
              />
              <div className="flex justify-end mt-2">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Забыли пароль?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg font-semibold shadow-glow hover:shadow-glow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Вход...</span>
                </div>
              ) : (
                'Войти в аккаунт'
              )}
            </button>
          </form>

          {/* Разделитель */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-secondary text-foreground/50">Или продолжите с</span>
            </div>
          </div>

          {/* Социальные кнопки */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              type="button"
              className="glass-card py-3.5 flex items-center justify-center gap-3 border border-border/50 hover:border-primary/30 hover:bg-secondary-light/50 transition-all duration-300"
            >
              <span className="text-xl">G</span>
              <span className="font-medium">Google</span>
            </button>
            <button
              type="button"
              className="glass-card py-3.5 flex items-center justify-center gap-3 border border-border/50 hover:border-primary/30 hover:bg-secondary-light/50 transition-all duration-300"
            >
              <span className="text-xl">f</span>
              <span className="font-medium">Facebook</span>
            </button>
          </div>

          {/* Ссылка на регистрацию */}
          <div className="text-center pt-6 border-t border-border/50">
            <p className="text-foreground/70 mb-3">
              Еще нет аккаунта?
            </p>
            <Link 
              href="/auth/register" 
              className="btn-secondary inline-flex items-center gap-2 px-8 py-3 text-lg group"
            >
              <span>Создать аккаунт</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>

        {/* Вспомогательный текст */}
        <div className="text-center mt-8">
          <p className="text-foreground/40 text-sm">
            Входя в аккаунт, вы соглашаетесь с нашими 
            <Link href="/terms" className="text-primary/70 hover:text-primary mx-1">Условиями</Link>
            и
            <Link href="/privacy" className="text-primary/70 hover:text-primary ml-1">Политикой конфиденциальности</Link>
          </p>
        </div>
      </div>
    </div>
  );
}