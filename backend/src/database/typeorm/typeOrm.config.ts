import { DataSourceOptions } from 'typeorm';

if (process.env.NODE_ENV !== 'production') {
  const { config } = require('dotenv');
  const { resolve } = require('path');
  config({ path: resolve(process.cwd(), 'src/common/envs/development.env') });
  console.log('>>> DB HOST:', process.env.DATABASE_HOST);
  console.log('>>> DB PASSWORD:', process.env.DATABASE_PASSWORD);
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  database: process.env.DATABASE_NAME || 'ecommercedb',
  username: process.env.DATABASE_USER || 'hassan',
  password: process.env.DATABASE_PASSWORD || 'password',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migration/history/*.js'],
  logger: 'simple-console',
  synchronize: false,
  logging: false,
};