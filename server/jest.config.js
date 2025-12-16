// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Где искать тесты
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Настройки для TypeScript
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  
  // Псевдонимы путей (если используете в проекте)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@graphql/(.*)$': '<rootDir>/src/graphql/$1',
  },
  
  // Игнорируемые пути
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Настройки покрытия кода
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  
  // Установочные скрипты
  //setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  
  // Явные расширения файлов
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};