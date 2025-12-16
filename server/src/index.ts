import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import cors from 'cors';
import { schema } from './graphql/schema';
import { context } from './graphql/context';
import { MONGO_URI, PORT } from './config/index';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { verifyToken } from './utils/auth';
import User from './models/User';

async function startServer() {
  const app = express();

  app.use(cors());

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  const server = new ApolloServer({ 
    schema, 
    context,
    csrfPrevention: false,
  });
  
  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  const httpServer = createServer(app);

  // WebSocket сервер для подписок
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Настройка graphql-ws
  useServer(
    {
      schema,
      context: async (ctx) => {
        // Получаем токен из connectionParams
        const token = (ctx.connectionParams as any)?.authorization?.replace('Bearer ', '') || '';
        
        if (!token) {
          console.log('⚠️  WebSocket connection without token');
          return { user: null };
        }

        try {
          const decoded: any = verifyToken(token);
          const user = await User.findById(decoded.id);
          
          if (user) {
            console.log('✅ WebSocket authenticated:', user.username);
          }
          
          return { user };
        } catch (err) {
          console.log('❌ WebSocket auth failed:', err);
          return { user: null };
        }
      },
      onConnect: (ctx) => {
        console.log('🔌 WebSocket client connected');
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket client disconnected');
      },
      onError: (ctx, msg, errors) => {
        console.error('❌ WebSocket error:', errors);
      },
    },
    wsServer
  );

  httpServer.listen(PORT, () => {
    console.log(`🚀 HTTP Server running at http://localhost:${PORT}/graphql`);
    console.log(`🚀 WebSocket Server ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer();