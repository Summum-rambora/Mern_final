import Link from 'next/link';
import { Movie } from '@/types';
import FavoriteButton from './Favoritebutton';
import { useAuthStore } from '@/store/auth';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { user } = useAuthStore();
  const isFavorite = user?.favoriteMovies?.some((m) => m.id === movie.id) || false;

  return (
    <div className="relative group h-full">
      <Link href={`/movies/${movie.id}`}>
        <div className="glass-card overflow-hidden cursor-pointer h-full flex flex-col hover-lift transition-all duration-500 border border-transparent hover:border-primary/20">
          <div className="h-48 bg-gradient-to-br from-primary via-accent to-primary-dark flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            <span className="text-white text-7xl font-bold opacity-30 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
              {movie.title.charAt(0)}
            </span>
            
            
            {/* Рейтинг на картинке */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-yellow-400">★</span>
              <span className="font-bold text-white">{movie.ratingAvg.toFixed(1)}</span>
            </div>
          </div>
          
          {/* Контент карточки */}
          <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-secondary/50 to-secondary/30">
            <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary-light transition-colors duration-300">
              {movie.title}
            </h3>
            
            {/* Описание */}
            <p className="text-foreground/80 text-sm mb-4 line-clamp-3 flex-1 group-hover:text-foreground transition-colors duration-300">
              {movie.description}
            </p>
            
            {/* Инфа */}
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center gap-2 text-foreground/60 group-hover:text-foreground/80 transition-colors duration-300">
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {movie.releaseYear}
                </span>
                <span className="text-foreground/30">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-accent rounded-full"></span>
                  {movie.duration} мин
                </span>
              </div>
            </div>
            
            {/* Жанры */}
            <div className="mt-auto">
              <div className="flex flex-wrap gap-2">
                {movie.genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={genre.id}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 group-hover:scale-105 ${
                      index % 2 === 0 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'bg-accent/10 text-accent border border-accent/20'
                    }`}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              
              {/* Подробнее */}
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-foreground/50 group-hover:text-foreground/70 transition-colors duration-300">
                  Подробнее
                </span>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow"></div>
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow ml-1" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow ml-1" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Эффект свечения при ховере */}
          <div className="absolute inset-0 rounded-xl shadow-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
      </Link>

      {/* Кнопка избранного */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <FavoriteButton movieId={movie.id} isFavorite={isFavorite} size="md" />
      </div>
    </div>
  );
}