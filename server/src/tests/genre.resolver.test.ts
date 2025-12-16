import { genreResolver } from '../graphql/resolvers/genre.resolver';
import Genre from '../models/Genre';

// Мокаем модель Genre
jest.mock('../src/models/Genre');

describe('genreResolver', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Query.genres', () => {
    it('должен вернуть список жанров (isArchived=false)', async () => {
      const mockGenres = [
        { _id: '1', name: 'Action', isArchived: false },
        { _id: '2', name: 'Drama', isArchived: false },
      ];

      // Настраиваем поведение мок-функции
      (Genre.find as jest.Mock).mockResolvedValue(mockGenres);

      const result = await genreResolver.Query!.genres!();

      expect(Genre.find).toHaveBeenCalledWith({ isArchived: false });
      expect(result).toEqual(mockGenres);
    });
  });

  describe('Mutation.createGenre', () => {
    it('должен создать новый жанр', async () => {
      const input = { name: 'Horror', isArchived: false };
      const mockGenre = { _id: '3', ...input };

      (Genre.create as jest.Mock).mockResolvedValue(mockGenre);

      const result = await genreResolver.Mutation!.createGenre!(null, { input });

      expect(Genre.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockGenre);
    });
  });
});
