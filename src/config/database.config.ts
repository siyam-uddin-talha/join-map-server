import 'dotenv/config';

export default {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/db/migrations/*.js'],
  cli: { migrationsDir: 'src/db/migrations' },
  synchronize: true,
  logging: true,
  logger: 'file',
  // ssl: { rejectUnauthorized: false },
};
