import dotenv from 'dotenv';
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cinema';
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const JWT_EXPIRES_IN = '7d';
export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
