
export const NEW_MOVIE_IN_GENRE = 'NEW_MOVIE_IN_GENRE';

export class MockAsyncIterator {
  private queue: any[] = [];
  private listeners: ((value: any) => void)[] = [];
  
  async next() {
    if (this.queue.length > 0) {
      return { value: this.queue.shift(), done: false };
    }
    
    // Если очередь пуста, ждем новых значений
    return new Promise((resolve) => {
      const listener = (value: any) => {
        resolve({ value, done: false });
        this.listeners = this.listeners.filter(l => l !== listener);
      };
      this.listeners.push(listener);
    });
  }
  
  return() {
    return Promise.resolve({ value: undefined, done: true });
  }
  
  throw(error: any) {
    return Promise.reject(error);
  }
  
  [Symbol.asyncIterator]() {
    return this;
  }
  
  // Метод для тестов, чтобы добавлять данные в итератор
  push(value: any) {
    if (this.listeners.length > 0) {
      const listener = this.listeners.shift();
      listener?.(value);
    } else {
      this.queue.push(value);
    }
  }
}

class MockPubSub {
  private events = new Map<string, MockAsyncIterator>();
  private subscriptions = new Map<string, Set<Function>>();
  
  asyncIterableIterator(eventName: string) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new MockAsyncIterator());
    }
    return this.events.get(eventName)!;
  }
  
  publish = jest.fn((eventName: string, payload: any) => {
    const iterator = this.events.get(eventName);
    if (iterator) {
      iterator.push({ [eventName]: payload });
    }
    
    // Вызываем подписчиков если есть
    const subscribers = this.subscriptions.get(eventName);
    if (subscribers) {
      subscribers.forEach(callback => callback(payload));
    }
    
    return Promise.resolve();
  });
  
  subscribe = jest.fn((eventName: string, callback: Function) => {
    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, new Set());
    }
    this.subscriptions.get(eventName)!.add(callback);
    
    // Возвращаем номер подписки (просто для совместимости)
    return Promise.resolve(this.subscriptions.get(eventName)!.size);
  });
  
  unsubscribe = jest.fn((subId: number) => {
    // Простая реализация для тестов
    return Promise.resolve(true);
  });
  
  // Методы для тестирования
  getEventIterator(eventName: string): MockAsyncIterator | undefined {
    return this.events.get(eventName);
  }
  
  getSubscribers(eventName: string): Function[] {
    return Array.from(this.subscriptions.get(eventName) || []);
  }
  
  clear() {
    this.events.clear();
    this.subscriptions.clear();
    this.publish.mockClear();
    this.subscribe.mockClear();
    this.unsubscribe.mockClear();
  }
}

// Экспортируем мок-экземпляр
export const pubsub = new MockPubSub() as any;

// Экспортируем вспомогательные функции из оригинального файла
export const logEvent = jest.fn();
export const publishWithLog = jest.fn();
export const isDevelopment = false;

// Экспортируем типы для удобства
export type MockPubSubInstance = MockPubSub;