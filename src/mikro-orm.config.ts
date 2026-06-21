import { defineConfig } from '@mikro-orm/postgresql';
import { Like } from './likes/like.entity';
import { User } from './users/user.entity';

/**
 * MikroORM 설정 (CLI `mikro-orm` + 앱 공용).
 * Supabase(Postgres) clientUrl은 DATABASE_URL로 주입. SSL 필요.
 */
export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [User, Like],
  // Supabase는 SSL 필수. v7(kysely/pg)에서는 ssl을 평탄하게 전달한다.
  driverOptions: { ssl: { rejectUnauthorized: false } },
  debug: false,
});
