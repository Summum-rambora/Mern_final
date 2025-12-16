export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  ratingAvg: number;
  genres: Genre[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  favoriteGenres: Genre[];
  favoriteMovies: Movie[];
  reviews?: Review[];
}

export interface Review {
  id: string;
  user: User;
  movie: Movie;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}