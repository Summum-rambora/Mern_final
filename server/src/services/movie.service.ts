import Movie from '../models/Movie';

export const createMovie = async (input: any) => {
  const movie = await Movie.create(input);
  return movie;
};

export const getMovies = async () => {
  return await Movie.find({ isDeleted: false }).populate('genres');
};

export const getMovieById = async (id: string) => {
  return await Movie.findById(id).populate('genres');
};
