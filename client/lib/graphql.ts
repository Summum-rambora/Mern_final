// lib/graphql/index.ts
import { gql } from '@apollo/client';

export const GET_MOVIES = gql`
  query GetMovies {
    movies {
      id
      title
      description
      releaseYear
      duration
      ratingAvg
      genres {
        id
        name
        slug
      }
      isDeleted
    }
  }
`;

export const GET_MOVIE = gql`
  query GetMovie($id: ID!) {
    movie(id: $id) {
      id
      title
      description
      releaseYear
      duration
      ratingAvg
      genres {
        id
        name
        slug
      }
      isDeleted
    }
  }
`;

export const CREATE_MOVIE = gql`
  mutation CreateMovie($input: MovieInput!) {
    createMovie(input: $input) {
      id
      title
      description
      releaseYear
      duration
      ratingAvg
      genres {
        id
        name
        slug
      }
      isDeleted
    }
  }
`;

export const GET_GENRES = gql`
  query GetGenres {
    genres {
      id
      name
      slug
    }
  }
`;

export const GET_REVIEWS_BY_MOVIE = gql`
  query GetReviewsByMovie($movieId: ID!) {
    reviewsByMovie(movieId: $movieId) {
      id
      rating
      comment
      createdAt
      user {
        id
        username
      }
    }
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        id
        username
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        email
        username
        role
      }
      token
    }
  }
`;

export const REGISTER = gql`
  mutation Register($email: String!, $username: String!, $password: String!) {
    register(email: $email, username: $username, password: $password) {
      user {
        id
        email
        username
        role
      }
      token
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      username
      role
      favoriteGenres {
        id
        name
        slug
      }
      favoriteMovies {
        id
        title
        releaseYear
        duration
        ratingAvg
      }
    }
  }
`;

export const TOGGLE_FAVORITE_GENRE = gql`
  mutation ToggleFavoriteGenre($genreId: ID!) {
    toggleFavoriteGenre(genreId: $genreId) {
      id
      favoriteGenres {
        id
        name
        slug
      }
    }
  }
`;

export const TOGGLE_FAVORITE_MOVIE = gql`
  mutation ToggleFavoriteMovie($movieId: ID!) {
    toggleFavoriteMovie(movieId: $movieId) {
      id
      favoriteMovies {
        id
        title
        releaseYear
        duration
        ratingAvg
      }
    }
  }
`;

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    myNotifications {
      id
      type
      title
      message
      payload
      isRead
      createdAt
    }
  }
`;

export const UNREAD_NOTIFICATIONS_COUNT = gql`
  query UnreadNotificationsCount {
    unreadNotificationsCount
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

// Добавьте GET_ALL_USERS
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      email
      username
      role
      isDeleted
      createdAt
    }
  }
`;

// Мутации для админ-панели
export const DELETE_MOVIE = gql`
  mutation DeleteMovie($id: ID!) {
    deleteMovie(id: $id) {
      id
      title
      isDeleted
    }
  }
`;

export const RESTORE_MOVIE = gql`
  mutation RestoreMovie($id: ID!) {
    restoreMovie(id: $id) {
      id
      title
      isDeleted
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      email
      isDeleted
    }
  }
`;

export const RESTORE_USER = gql`
  mutation RestoreUser($id: ID!) {
    restoreUser(id: $id) {
      id
      email
      isDeleted
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: String!) {
    updateUserRole(id: $id, role: $role) {
      id
      email
      username
      role
    }
  }
`;

