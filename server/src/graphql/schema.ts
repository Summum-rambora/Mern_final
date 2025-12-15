import { makeExecutableSchema } from '@graphql-tools/schema';
import { movieResolver } from './resolvers/movie.resolver';
import { reviewResolver } from './resolvers/review.resolver';
import { genreResolver } from './resolvers/genre.resolver';
import { userResolver } from './resolvers/user.resolver';
import { subscriptionResolver } from './resolvers/subscription.resolver';


import typeDefs from './typeDefs';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: [movieResolver, reviewResolver, genreResolver, userResolver, subscriptionResolver],
});
