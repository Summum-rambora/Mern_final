import { IResolvers } from '@graphql-tools/utils';
import User from '../../models/User';
import { pubsub, NEW_MOVIE_IN_GENRE } from '../../pubsub';
import { withFilter } from 'graphql-subscriptions';

export const subscriptionResolver: IResolvers = {
  Subscription: {
    movieAddedToFavoriteGenre: {    
      subscribe: withFilter(
        () => {
          console.log('\n🔔 NEW SUBSCRIPTION STARTED');
          console.log('Listening for:', NEW_MOVIE_IN_GENRE);
          
          const iterator = pubsub.asyncIterableIterator(NEW_MOVIE_IN_GENRE);
          console.log('Iterator created successfully\n');
          return iterator;
        },
        
        async (payload, variables, context) => {
          console.log('\n=== SUBSCRIPTION FILTER CALLED ===');
          console.log('Payload genreId:', payload.genreId);
          console.log('Movie:', payload.movieAddedToFavoriteGenre?.title);
          console.log('Context user:', context?.user?.id);

          const { user } = context;
          
          if (!user) {
            console.log('No user in context');
            console.log('=== END FILTER (rejected) ===\n');
            return false;
          }

          try {
            const existingUser = await User.findById(user.id);

            if (!existingUser) {
              console.log('User not found in database');
              console.log('=== END FILTER (rejected) ===\n');
              return false;
            }
            
            const userFavoriteGenres = existingUser.favoriteGenres.map(id => id.toString());
            const payloadGenreId = payload.genreId.toString();
            
            console.log('User favorite genres:', userFavoriteGenres);
            console.log('Checking if includes:', payloadGenreId);
            
            const isSubscribed = userFavoriteGenres.includes(payloadGenreId);
            
            console.log(isSubscribed ? 'User IS subscribed to this genre!' : ' User NOT subscribed to this genre');
            console.log('END FILTER\n');
            
            return isSubscribed;
          } catch (error) {
            console.error('Error in filter:', error);
            console.log('END FILTER (error)\n');
            return false;
          }
        }
      ),
      resolve: (payload) => {
        console.log('\n SUBSCRIPTION RESOLVE - Sending movie to client');
        console.log('Movie:', payload.movieAddedToFavoriteGenre?.title);
        console.log('');
        return payload.movieAddedToFavoriteGenre;
      }
    }
  }
};