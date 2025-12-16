import { movieResolver } from '../graphql/resolvers/movie.resolver';
import Movie from '../models/Movie';
import { pubsub, NEW_MOVIE_IN_GENRE } from '../pubsub';
import { requireAdmin } from '../utils/authHelpers';

jest.mock('../models/Movie');
jest.mock('../pubsub');
jest.mock('../utils/authHelpers');

const createMockQuery = (returnValue: any) => {
  const mockQuery = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
    then: jest.fn().mockImplementation(function(this: any, callback: any) {
      return Promise.resolve(returnValue).then(callback);
    }),
    catch: jest.fn().mockImplementation(function(this: any, callback: any) {
      return Promise.resolve(returnValue).catch(callback);
    }),
    $where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    nin: jest.fn().mockReturnThis(),
    ne: jest.fn().mockReturnThis(),
    regex: jest.fn().mockReturnThis(),
    exists: jest.fn().mockReturnThis(),
    elemMatch: jest.fn().mockReturnThis(),
    size: jest.fn().mockReturnThis(),
    _mongooseOptions: {},
    _transforms: [],
    _update: {},
    _conditions: {},
    _fields: undefined,
    _updateOperators: {},
    _path: '',
    _distinct: undefined,
    _collection: {} as any,
    _traceFunction: undefined,
    setQuery: jest.fn().mockReturnThis(),
    setUpdate: jest.fn().mockReturnThis(),
    setOptions: jest.fn().mockReturnThis(),
    mongooseCollection: {} as any,
    model: {} as any,
    schema: {} as any,
    op: undefined,
    options: {},
    _updateForExec: jest.fn(),
    toConstructor: jest.fn(),
    getQuery: jest.fn().mockReturnValue({}),
    getUpdate: jest.fn().mockReturnValue({}),
    g: jest.fn().mockReturnThis(),
    l: jest.fn().mockReturnThis(),
    m: jest.fn().mockReturnThis(),
    n: jest.fn().mockReturnThis(),
    [Symbol.toPrimitive]: jest.fn(),
    [Symbol.toStringTag]: 'MockQuery'
  };

  if (returnValue instanceof Error) {
    mockQuery.exec.mockRejectedValue(returnValue);
    mockQuery.then.mockImplementation(function(this: any, onFulfilled: any, onRejected: any) {
      return Promise.reject(returnValue).then(onFulfilled, onRejected);
    });
  }

  return mockQuery;
};

const mockMovie = {
  _id: 'movie123',
  id: 'movie123',
  title: 'Test Movie',
  year: 2023,
  isDeleted: false,
  createdAt: new Date(),
  genres: [
    { _id: 'genre1', id: 'genre1', name: 'Action' },
    { _id: 'genre2', id: 'genre2', name: 'Drama' }
  ],
  toObject: jest.fn().mockReturnValue({
    id: 'movie123',
    title: 'Test Movie',
    year: 2023,
    genres: [
      { id: 'genre1', name: 'Action' },
      { id: 'genre2', name: 'Drama' }
    ]
  }),
  populate: jest.fn().mockResolvedValue({
    _id: 'movie123',
    id: 'movie123',
    title: 'Test Movie',
    genres: [
      { _id: 'genre1', id: 'genre1', name: 'Action', toString: () => 'genre1' },
      { _id: 'genre2', id: 'genre2', name: 'Drama', toString: () => 'genre2' }
    ],
    toObject: jest.fn().mockReturnValue({
      id: 'movie123',
      title: 'Test Movie',
      year: 2023
    })
  })
};

const mockMovieModel = Movie as jest.Mocked<typeof Movie>;
const mockPubsub = pubsub as jest.Mocked<typeof pubsub>;
const mockRequireAdmin = requireAdmin as jest.Mock;

describe('movieResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  const resolver = movieResolver as any;

  describe('Query', () => {
    describe('movies', () => {
      it('should return all non-deleted movies with populated genres sorted by date', async () => {
        const mockMovies = [mockMovie];
        const mockQuery = createMockQuery(mockMovies);
        mockMovieModel.find.mockReturnValue(mockQuery as any);

        const result = await resolver.Query.movies();

        expect(mockMovieModel.find).toHaveBeenCalledWith({ isDeleted: false });
        expect(mockQuery.populate).toHaveBeenCalledWith('genres');
        expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(result).toEqual(mockMovies);
      });

      it('should handle errors when fetching movies', async () => {
        const error = new Error('Database error');
        const mockQuery = createMockQuery(error);
        mockMovieModel.find.mockReturnValue(mockQuery as any);

        await expect(resolver.Query.movies()).rejects.toThrow('Database error');
      });
    });

    describe('movie', () => {
      it('should return a movie by id with populated genres', async () => {
        const mockQuery = createMockQuery(mockMovie);
        mockMovieModel.findById.mockReturnValue(mockQuery as any);

        const result = await resolver.Query.movie(null, { id: 'movie123' });

        expect(mockMovieModel.findById).toHaveBeenCalledWith('movie123');
        expect(mockQuery.populate).toHaveBeenCalledWith('genres');
        expect(result).toEqual(mockMovie);
      });

      it('should throw error when movie not found', async () => {
        const mockQuery = createMockQuery(null);
        mockMovieModel.findById.mockReturnValue(mockQuery as any);

        await expect(
          resolver.Query.movie(null, { id: 'nonexistent' })
        ).rejects.toThrow('Movie not found');
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

      const mockAdminContext = {
        user: {
          id: 'admin123',
          email: 'admin@test.com',
          role: 'ADMIN'
        }
      };

      beforeEach(() => {
        mockMovieModel.create.mockImplementation((input: any) => {
          const result = {
            ...mockMovie,
            ...input,
            populate: jest.fn().mockResolvedValue({
              ...mockMovie,
              ...input,
              genres: [
                { _id: 'genre1', id: 'genre1', name: 'Action', toString: () => 'genre1' },
                { _id: 'genre2', id: 'genre2', name: 'Drama', toString: () => 'genre2' }
              ]
            })
          };
          return Promise.resolve(result);
        });
        
        mockPubsub.publish = jest.fn();
        mockRequireAdmin.mockImplementation(() => {});
      });

      it('should create a movie and publish events for each genre (admin only)', async () => {
        // Act
        const result = await resolver.Mutation.createMovie(
          null, 
          { input: mockInput }, 
          mockAdminContext
        );

        expect(mockRequireAdmin).toHaveBeenCalledWith(mockAdminContext);

        expect(mockMovieModel.create).toHaveBeenCalledWith(mockInput);
        
        expect(mockPubsub.publish).toHaveBeenCalledTimes(2);
        expect(mockPubsub.publish).toHaveBeenCalledWith(NEW_MOVIE_IN_GENRE, {
          genreId: 'genre1',
          movieAddedToFavoriteGenre: expect.objectContaining({
            id: 'movie123',
            title: 'Test Movie'
          })
        });

        expect(console.log).toHaveBeenCalledWith('\n=== CREATING MOVIE ===');
        expect(console.log).toHaveBeenCalledWith('Movie created with ID:', 'movie123');
        expect(console.log).toHaveBeenCalledWith('Created by admin:', 'admin@test.com');
        
        expect(result).toBeDefined();
      });

      it('should handle movie with no genres', async () => {
        mockMovieModel.create.mockImplementation((input: any) => {
          const result = {
            ...mockMovie,
            ...input,
            genres: [],
            populate: jest.fn().mockResolvedValue({
              ...mockMovie,
              ...input,
              genres: []
            })
          };
          return Promise.resolve(result);
        });

        await resolver.Mutation.createMovie(
          null, 
          { input: { ...mockInput, genres: [] } }, 
          mockAdminContext
        );

        expect(mockPubsub.publish).not.toHaveBeenCalled();
      });

      it('should handle single genre', async () => {
        mockMovieModel.create.mockImplementation((input: any) => {
          const result = {
            ...mockMovie,
            ...input,
            populate: jest.fn().mockResolvedValue({
              ...mockMovie,
              ...input,
              genres: [
                { _id: 'genre1', id: 'genre1', name: 'Action', toString: () => 'genre1' }
              ]
            })
          };
          return Promise.resolve(result);
        });

        await resolver.Mutation.createMovie(
          null, 
          { input: { ...mockInput, genres: ['genre1'] } }, 
          mockAdminContext
        );

        expect(mockPubsub.publish).toHaveBeenCalledTimes(1);
        expect(mockPubsub.publish).toHaveBeenCalledWith(NEW_MOVIE_IN_GENRE, expect.objectContaining({
          genreId: 'genre1'
        }));
      });

      it('should handle publication errors gracefully', async () => {
        const publicationError = new Error('PubSub error');
        mockPubsub.publish.mockImplementation(() => {
          throw publicationError;
        });

        const result = await resolver.Mutation.createMovie(
          null, 
          { input: { ...mockInput, genres: ['genre1'] } }, 
          mockAdminContext
        );

        expect(result).toBeDefined();
        expect(console.error).toHaveBeenCalledWith('❌ Publish failed:', publicationError);
      });

      it('should handle database errors during creation', async () => {
        const dbError = new Error('Database error');
        mockMovieModel.create.mockRejectedValue(dbError);

        await expect(
          resolver.Mutation.createMovie(null, { input: mockInput }, mockAdminContext)
        ).rejects.toThrow('Database error');
        
        expect(mockPubsub.publish).not.toHaveBeenCalled();
      });

      it('should throw error if not admin', async () => {
        const notAdminContext = {
          user: {
            id: 'user123',
            email: 'user@test.com',
            role: 'USER'
          }
        };
        
        mockRequireAdmin.mockImplementation(() => {
          throw new Error('Admin access required');
        });

        await expect(
          resolver.Mutation.createMovie(null, { input: mockInput }, notAdminContext)
        ).rejects.toThrow('Admin access required');
        
        expect(mockMovieModel.create).not.toHaveBeenCalled();
      });
    });

    describe('updateMovie', () => {
      const mockUpdateInput = {
        title: 'Updated Movie',
        year: 2024
      };

      const mockAdminContext = {
        user: { id: 'admin123', email: 'admin@test.com', role: 'ADMIN' }
      };

      beforeEach(() => {
        mockRequireAdmin.mockImplementation(() => {});
      });

      it('should update movie (admin only)', async () => {
        const updatedMovie = {
          ...mockMovie,
          title: 'Updated Movie',
          year: 2024
        };
        
        const mockQuery = createMockQuery(updatedMovie);
        mockMovieModel.findByIdAndUpdate.mockReturnValue(mockQuery as any);

        const result = await resolver.Mutation.updateMovie(
          null,
          { id: 'movie123', input: mockUpdateInput },
          mockAdminContext
        );

        expect(mockRequireAdmin).toHaveBeenCalledWith(mockAdminContext);
        expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'movie123',
          { ...mockUpdateInput, updatedAt: expect.any(Date) },
          { new: true }
        );
        expect(mockQuery.populate).toHaveBeenCalledWith('genres');
        expect(result).toEqual(updatedMovie);
      });

      it('should throw error if movie not found', async () => {
        const mockQuery = createMockQuery(null);
        mockMovieModel.findByIdAndUpdate.mockReturnValue(mockQuery as any);

        await expect(
          resolver.Mutation.updateMovie(
            null,
            { id: 'nonexistent', input: mockUpdateInput },
            mockAdminContext
          )
        ).rejects.toThrow('Movie not found');
      });
    });

    describe('deleteMovie', () => {
      const mockAdminContext = {
        user: { id: 'admin123', email: 'admin@test.com', role: 'ADMIN' }
      };

      beforeEach(() => {
        mockRequireAdmin.mockImplementation(() => {});
      });

      it('should soft delete movie (admin only)', async () => {
        // Arrange
        const deletedMovie = {
          ...mockMovie,
          isDeleted: true
        };
        
        const mockQuery = createMockQuery(deletedMovie);
        mockMovieModel.findByIdAndUpdate.mockReturnValue(mockQuery as any);

        const result = await resolver.Mutation.deleteMovie(
          null,
          { id: 'movie123' },
          mockAdminContext
        );

        expect(mockRequireAdmin).toHaveBeenCalledWith(mockAdminContext);
        expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'movie123',
          { isDeleted: true, updatedAt: expect.any(Date) },
          { new: true }
        );
        expect(result).toEqual(deletedMovie);
      });
    });
  });
});