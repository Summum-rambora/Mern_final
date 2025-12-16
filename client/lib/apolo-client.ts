import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// WebSocket Link для подписки
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_WS_URI || 'ws://localhost:4000/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    on: {
      connected: () => console.log('🔌 WebSocket connected'),
      closed: () => console.log('🔌 WebSocket closed'),
      error: (error) => console.error('🔌 WebSocket error:', error),
    },
  })
) : null;

// разделитель для маршрутизации запросов
const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});