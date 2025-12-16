import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Genre {
    id: ID!
    name: String!
    slug: String!
  }

  type Movie {
    id: ID!
    title: String!
    description: String!
    releaseYear: Int!
    duration: Int!
    ratingAvg: Float!
    genres: [Genre!]!
  }

  type Review {
    id: ID!
    user: User!
    movie: Movie!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    role: String!
    favoriteGenres: [Genre!]!
    favoriteMovies: [Movie!]!
  }

  enum NotificationType {
    NEW_REVIEW
    REVIEW_REPLY
    NEW_MOVIE
    SYSTEM
  }

  type Notification {
    id: ID!
    userId: ID!
    type: NotificationType!
    title: String!
    message: String!
    payload: String
    isRead: Boolean!
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
    user: User!
  }

  input MovieInput {
    title: String!
    description: String!
    releaseYear: Int!
    duration: Int!
    genres: [ID!]!
  }

  input GenreInput {
    name: String!
    slug: String!
  }

  input ReviewInput {
    user: ID!
    movie: ID!
    rating: Int!
    comment: String
  }

  input NotificationInput {
    userId: ID!
    type: NotificationType!
    title: String!
    message: String!
    payload: String
    
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
    movies: [Movie!]!
    movie(id: ID!): Movie
    genres: [Genre!]!
    reviewsByMovie(movieId: ID!): [Review!]!
    me: User
    myNotifications: [Notification!]!
    unreadNotificationsCount: Int!
  }

  type Mutation {
    createMovie(input: MovieInput!): Movie!
    createGenre(input: GenreInput!): Genre!
    createReview(input: ReviewInput!): Review!
    register(email: String!, username: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createNotification(input: NotificationInput!): Notification!
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!
    deleteNotification(id: ID!): Notification!
    toggleFavoriteGenre(genreId: ID!): User!
    toggleFavoriteMovie(movieId: ID!): User!
  }

  type Subscription {
    notificationCreated: Notification!
    movieAddedToFavoriteGenre: Movie!
  }
`;

export default typeDefs;