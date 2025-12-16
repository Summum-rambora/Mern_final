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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎬</text></svg>" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <ApolloWrapper>
          <Header />
          
          <main className="min-h-screen">
            {children}
          </main>

          <footer className="border-t border-zinc-800 bg-zinc-900">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center">
                    <span className="text-white text-lg">🎬</span>
                  </div>
                  <span className="text-lg font-bold text-orange-500">CinemaHub</span>
                </div>
                
                <p className="text-zinc-500 text-sm">
                  © {new Date().getFullYear()} CinemaHub. Все права защищены.
                </p>
              </div>
            </div>
          </footer>
        </ApolloWrapper>
      </body>
    </html>
  );
}