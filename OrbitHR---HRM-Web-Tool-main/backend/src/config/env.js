import dotenv from 'dotenv';

dotenv.config({ override: true });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientUrls: (process.env.CLIENT_URLS || '').split(',').map((value) => value.trim()).filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || 'orbithr-jwt-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
};
