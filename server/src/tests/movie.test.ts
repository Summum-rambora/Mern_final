// movieResolver.test.ts
import { movieResolver } from '../graphql/resolvers/movie.resolver';
import Movie from '../models/Movie';
import { pubsub, NEW_MOVIE_IN_GENRE } from '../pubsub';

// Моки
jest.mock('../../models/Movie');
jest.mock('../../pubsub');

const mockMovie = {
  _id: 'movie123',
  id: 'movie123',
  title: 'Test Movie',
  genres: [
    { _id: 'genre1', id: 'genre1', name: 'Action' },
    { _id: 'genre2', id: 'genre2', name: 'Drama' }
  ],
  toObject: jest.fn().mockReturnValue({
    id: 'movie123',
    title: 'Test Movie',
    year: 2023
  }),
  populate: jest.fn().mockReturnThis()
};

const mockMovieModel = Movie as jest.Mocked<typeof Movie>;
const mockPubsub = pubsub as jest.Mocked<typeof pubsub>;

describe('movieResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe('Query', () => {
    describe('movies', () => {
      it('should return all non-deleted movies with populated genres', async () => {
        // Arrange
        const mockMovies = [mockMovie];
        mockMovieModel.find.mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockMovies)
        } as any);

        // Act
        const result = await movieResolver.Query.movies();

        // Assert
        expect(mockMovieModel.find).toHaveBeenCalledWith({ isDeleted: false });
        expect(result).toEqual(mockMovies);
      });

      it('should handle errors when fetching movies', async () => {
        // Arrange
        const error = new Error('Database error');
        mockMovieModel.find.mockReturnValue({
          populate: jest.fn().mockRejectedValue(error)
        } as any);

        // Act & Assert
        await expect(movieResolver.Query.movies()).rejects.toThrow('Database error');
      });
    });

    describe('movie', () => {
      it('should return a movie by id with populated genres', async () => {
        // Arrange
        mockMovieModel.findById.mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockMovie)
        } as any);

        // Act
        const result = await movieResolver.Query.movie(null, { id: 'movie123' });

        // Assert
        expect(mockMovieModel.findById).toHaveBeenCalledWith('movie123');
        expect(result).toEqual(mockMovie);
      });

      it('should return null when movie not found', async () => {
        // Arrange
        mockMovieModel.findById.mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        } as any);

        // Act
        const result = await movieResolver.Query.movie(null, { id: 'nonexistent' });

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('Mutation', () => {
    describe('createMovie', () => {
      const mockInput = {
        title: 'Test Movie',
        year: 2023,
        genres: ['genre1', 'genre2']
      };

      beforeEach(() => {
        mockMovieModel.create.mockResolvedValue(mockMovie);
        mockPubsub.publish = jest.fn();
      });

      it('should create a movie and publish events for each genre', async () => {
        // Act
        const result = await movieResolver.Mutation.createMovie(null, { input: mockInput });

        // Assert - Creation
        expect(mockMovieModel.create).toHaveBeenCalledWith(mockInput);
        expect(mockMovie.populate).toHaveBeenCalledWith('genres');
        expect(result).toEqual(mockMovie);

        // Assert - Publication
        expect(mockPubsub.publish).toHaveBeenCalledTimes(2);
        expect(mockPubsub.publish).toHaveBeenCalledWith(NEW_MOVIE_IN_GENRE, {
          genreId: 'genre1',
          movieAddedToFavoriteGenre: expect.objectContaining({
            id: 'movie123',
            title: 'Test Movie'
          })
        });
        expect(mockPubsub.publish).toHaveBeenCalledWith(NEW_MOVIE_IN_GENRE, {
          genreId: 'genre2',
          movieAddedToFavoriteGenre: expect.objectContaining({
            id: 'movie123',
            title: 'Test Movie'
          })
        });

        // Assert - Logging
        expect(console.log).toHaveBeenCalledWith('\n=== CREATING MOVIE ===');
        expect(console.log).toHaveBeenCalledWith('Input:', JSON.stringify(mockInput, null, 2));
        expect(console.log).toHaveBeenCalledWith('Movie created with ID:', 'movie123');
      });

      it('should handle movie with no genres', async () => {
        // Arrange
        const movieWithoutGenres = {
          ...mockMovie,
          genres: []
        };
        mockMovieModel.create.mockResolvedValue({
          ...movieWithoutGenres,
          populate: jest.fn().mockResolvedValue(movieWithoutGenres)
        } as any);

        // Act
        await movieResolver.Mutation.createMovie(null, { input: { ...mockInput, genres: [] } });

        // Assert
        expect(mockPubsub.publish).not.toHaveBeenCalled();
      });

      it('should handle single genre', async () => {
        // Arrange
        const movieWithOneGenre = {
          ...mockMovie,
          genres: [mockMovie.genres[0]]
        };
        mockMovieModel.create.mockResolvedValue({
          ...movieWithOneGenre,
          populate: jest.fn().mockResolvedValue(movieWithOneGenre)
        } as any);

        // Act
        await movieResolver.Mutation.createMovie(null, { input: { ...mockInput, genres: ['genre1'] } });

        // Assert
        expect(mockPubsub.publish).toHaveBeenCalledTimes(1);
        expect(mockPubsub.publish).toHaveBeenCalledWith(NEW_MOVIE_IN_GENRE, expect.objectContaining({
          genreId: 'genre1'
        }));
      });

      it('should handle publication errors gracefully', async () => {
        // Arrange
        const publicationError = new Error('PubSub error');
        mockPubsub.publish.mockImplementation(() => {
          throw publicationError;
        });

        // Act
        const result = await movieResolver.Mutation.createMovie(null, { input: mockInput });

        // Assert
        expect(result).toEqual(mockMovie);
        expect(console.error).toHaveBeenCalledWith('❌ Publish failed:', publicationError);
      });

      it('should handle database errors during creation', async () => {
        // Arrange
        const dbError = new Error('Database error');
        mockMovieModel.create.mockRejectedValue(dbError);

        // Act & Assert
        await expect(
          movieResolver.Mutation.createMovie(null, { input: mockInput })
        ).rejects.toThrow('Database error');
        
        expect(mockPubsub.publish).not.toHaveBeenCalled();
      });
    });
  });
});