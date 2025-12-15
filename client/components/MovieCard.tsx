import Link from 'next/link';
import { Movie } from '@/types';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white text-6xl font-bold opacity-20">
            {movie.title.charAt(0)}
          </span>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{movie.title}</h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3 flex-1">
            {movie.description}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{movie.releaseYear}</span>
            <span className="text-gray-500">{movie.duration} мин</span>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {movie.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre.id}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{movie.ratingAvg.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}