// pubsub.ts
import { PubSub } from 'graphql-subscriptions';

// Создаем единственный экземпляр PubSub
export const pubsub = new PubSub();

// Экспортируем константы событий
export const NEW_MOVIE_IN_GENRE = 'NEW_MOVIE_IN_GENRE';

// Интерфейсы для типизации событий (опционально)
export interface PubSubPayloads {
  [NEW_MOVIE_IN_GENRE]: {
    genreId: string;
    movieAddedToFavoriteGenre: any;
  };
}

// Вспомогательный тип для безопасной публикации
export type PubSubEvent = keyof PubSubPayloads;

// Утилиты для разработки (можно отключить в production)
const isDevelopment = process.env.NODE_ENV === 'development';

export const logEvent = (eventName: string, payload: any) => {
  if (isDevelopment) {
    console.log(`[PUBSUB] ${eventName}:`, {
      timestamp: new Date().toISOString(),
      payload: typeof payload === 'object' ? { ...payload } : payload
    });
  }
};

// Обертка для публикации с логированием
export const publishWithLog = <T extends PubSubEvent>(
  eventName: T,
  payload: PubSubPayloads[T]
) => {
  logEvent(eventName, payload);
  return pubsub.publish(eventName, payload);
};