import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import cors from 'cors';
import { schema } from './graphql/schema';
import { context } from './graphql/context';
import { MONGO_URI, PORT } from './config/index';

async function startServer() {
  const app = express();

  app.use(cors());

  // ⚡ Принудительно кастуем в any, чтобы TS не ругался
  const server = new ApolloServer({ schema, context });
  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/graphql`));
}

startServer();
