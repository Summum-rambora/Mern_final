// typeDefs.ts
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
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
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
  isDeleted: Boolean!
  createdAt: String!   
  updatedAt: String!   
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

  input MovieUpdateInput {
    title: String
    description: String
    releaseYear: Int
    duration: Int
    genres: [ID!]
  }

  input GenreInput {
    name: String!
    slug: String!
  }

  input GenreUpdateInput {
    name: String
    slug: String
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
    deletedMovies: [Movie!]! @admin
    genres: [Genre!]!
    reviewsByMovie(movieId: ID!): [Review!]!
    me: User @auth
    myNotifications: [Notification!]! @auth
    unreadNotificationsCount: Int! @auth
    allUsers: [User!]! @admin
  }

  type Mutation {
    # Movie mutations
    createMovie(input: MovieInput!): Movie! @admin
    updateMovie(id: ID!, input: MovieUpdateInput!): Movie! @admin
    deleteMovie(id: ID!): Movie! @admin
    restoreMovie(id: ID!): Movie! @admin
    
    # Genre mutations
    createGenre(input: GenreInput!): Genre! @admin
    updateGenre(id: ID!, input: GenreUpdateInput!): Genre! @admin
    archiveGenre(id: ID!): Genre! @admin
    restoreGenre(id: ID!): Genre! @admin
    
    # Review mutations
    createReview(input: ReviewInput!): Review! @auth
    updateReview(id: ID!, rating: Int, comment: String): Review! @auth
    deleteReview(id: ID!): Review! @auth
    
    # User mutations
    register(email: String!, username: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateUser(input: UserUpdateInput!): User! @auth
    deleteUser(id: ID!): User! @admin
    restoreUser(id: ID!): User! @admin
    updateUserRole(id: ID!, role: String!): User! @admin
    toggleFavoriteGenre(genreId: ID!): User! @auth
    toggleFavoriteMovie(movieId: ID!): User! @auth
    
    # Notification mutations
    createNotification(input: NotificationInput!): Notification! @admin
    markNotificationAsRead(id: ID!): Notification! @auth
    markAllNotificationsAsRead: Boolean! @auth
    deleteNotification(id: ID!): Notification! @auth
  }

  type Subscription {
    notificationCreated: Notification!
    movieAddedToFavoriteGenre: Movie!
  }

  # Директивы для контроля доступа
  directive @auth on FIELD_DEFINITION
  directive @admin on FIELD_DEFINITION

  # Дополнительные Input типы
  input UserUpdateInput {
    email: String
    username: String
    password: String
  }
`;

export default typeDefs;