import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const NEW_MOVIE_IN_GENRE = 'NEW_MOVIE_IN_GENRE';