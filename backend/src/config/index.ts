import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'hrm_enterprise_jwt_secret_key_at_least_32_characters_long_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'hrm_enterprise_refresh_token_secret_key_2026_super_secure',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
