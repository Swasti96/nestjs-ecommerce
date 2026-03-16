import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSourceOptions } from 'typeorm';

const envPath = resolve(process.cwd(), 'src/common/envs/development.env');
console.log('>>> ENV PATH:', envPath);
config({ path: envPath });
console.log('>>> DB PASSWORD:', process.env.DATABASE_PASSWORD);
console.log('>>> DB HOST:', process.env.DATABASE_HOST);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  database: process.env.DATABASE_NAME || 'ecommercedb',
  username: process.env.DATABASE_USER || 'hassan',
  password: process.env.DATABASE_PASSWORD || 'password',
  entities: [process.env.DATABASE_ENTITIES || 'dist/**/*.entity.{ts,js}'],
  migrations: ['dist/database/migration/history/*.js'],
  logger: 'simple-console',
  synchronize: false,
  logging: true,
};