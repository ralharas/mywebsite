import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const { Pool } = pg;

// Prefer DATABASE_URL in production. Fall back to discrete PG* env vars or sensible locals in development.
const isProd = process.env.NODE_ENV === 'production';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // Many hosted Postgres providers (Render, Neon, Railway, etc.) require SSL.
      // Use ssl=false only if explicitly disabled via PGSSL_DISABLE=true.
      ssl: process.env.PGSSL_DISABLE === 'true' ? false : { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5433', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'my-website',
      ssl: (process.env.PGSSL === 'require' || isProd) ? { rejectUnauthorized: false } : false,
    });

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
