import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import cors from 'cors';
import { schema } from './graphql/schema';
import { context } from './graphql/context';
import { MONGO_URI, PORT } from './config/index';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

async function startServer() {
  const app = express();

  app.use(cors());

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  const server = new ApolloServer({ schema, context });
  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  const httpServer = createServer(app);

  httpServer.listen(PORT, () => {
   console.log(`🚀 HTTP Server running at http://localhost:${PORT}/graphql`);

   const subscriptionContext = async (connectionParams: any) => {
     const authorization = connectionParams.authorization || '';

      const fakeReq = { headers: { authorization } };

     return context({ req: fakeReq as any }); 
   };
   
   new SubscriptionServer(
     {
      execute,
      subscribe,
      schema,
      onConnect: subscriptionContext,
     },
     {
      server: httpServer,
      path: server.graphqlPath,
     }
   );

    console.log(`🚀 WebSocket Server ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer();
