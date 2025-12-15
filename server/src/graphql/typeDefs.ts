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
  }

  type User {
    id: ID!
    email: String!
    username: String!
    role: String!
    favoriteGenres: [Genre!]!
    favoriteMovies: [Movie!]!
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
  }

  type Mutation {
    createMovie(input: MovieInput!): Movie!
    createGenre(input: GenreInput!): Genre!
    createReview(input: ReviewInput!): Review!
    register(email: String!, username: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
    type Subscription {
  notificationCreated: Notification!
}

type Notification {
  id: ID!
  message: String!
  movie: Movie
  user: User
}

`;

export default typeDefs;
