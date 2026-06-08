import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const { Pool } = pg;

// Prefer DATABASE_URL in production. Fall back to discrete PG* env vars or sensible locals in development.
const isProd = process.env.NODE_ENV === 'production';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL_DISABLE === 'true' ? false : { rejectUnauthorized: false },
      max: 20, 
      idleTimeoutMillis: 30000, 
      connectionTimeoutMillis: 10000,
    })
  : (isProd
      ? (() => { throw new Error('DATABASE_URL is required in production'); })()
      : new Pool({
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5433', 10),
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || '',
          database: process.env.PGDATABASE || 'my-website',
          ssl: (process.env.PGSSL === 'require') ? { rejectUnauthorized: false } : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        })
    );

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});


export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
