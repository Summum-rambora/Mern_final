import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "@/components/ApolloWrapper";
import Header from "@/components/Header";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "CinemaHub - Ваша библиотека фильмов",
  description: "Современный каталог фильмов с отзывами, рейтингами и персонализированными рекомендациями",
  keywords: ["фильмы", "сериалы", "каталог", "рейтинги", "отзывы", "кино"],
  authors: [{ name: "CinemaHub Team" }],
  openGraph: {
    type: 'website',
    title: 'CinemaHub - Ваша библиотека фильмов',
    description: 'Современный каталог фильмов с отзывами и рейтингами',
    siteName: 'CinemaHub',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        {/* Фавиконки в оранжевой тематике */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎬</text></svg>" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎬</text></svg>" />
        
        {/* Gradient meta для соц сетей */}
        <meta name="theme-color" content="#FF5722" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#FF5722" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ApolloWrapper>
          {/* Градиентный фон для всего сайта */}
          <div className="fixed inset-0 -z-10 h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-secondary to-black opacity-100"></div>
            <div className="absolute top-0 left-1/4 h-96 w-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-accent/5 rounded-full blur-3xl"></div>
            
            {/* Текстура */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23FF5722%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          </div>

          <Header />
          
          <main className="min-h-screen relative z-0">
            {/* Акцентные элементы */}
            <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-primary animate-pulse-slow opacity-70"></div>
            <div className="absolute top-40 right-20 w-6 h-6 rounded-full bg-accent animate-pulse-slow opacity-50" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-3 h-3 rounded-full bg-primary animate-pulse-slow opacity-60" style={{ animationDelay: '0.6s' }}></div>
            
            {children}
          </main>

          {/* Футер (можно добавить позже) */}
          <footer className="relative z-10 border-t border-border/50 bg-secondary/50 backdrop-blur-sm">
            <div className="container-smooth py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white text-lg">🎬</span>
                  </div>
                  <span className="text-lg font-bold gradient-text">CinemaHub</span>
                </div>
                
                <div className="text-center md:text-right">
                  <p className="text-foreground/70 text-sm">
                    © {new Date().getFullYear()} CinemaHub. Все права защищены.
                  </p>
                  <p className="text-foreground/50 text-xs mt-1">
                    Любите кино так же, как и мы
                  </p>
                </div>
              </div>
              
              {/* Нижняя акцентная линия */}
              <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            </div>
          </footer>
        </ApolloWrapper>
      </body>
    </html>
  );
}