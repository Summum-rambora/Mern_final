import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "@/components/ApolloWrapper";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "CinemaApp - Каталог фильмов",
  description: "Современный каталог фильмов с отзывами и рейтингами",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ApolloWrapper>
          <Header />
          <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {children}
          </main>
        </ApolloWrapper>
      </body>
    </html>
  );
}