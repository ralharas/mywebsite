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
      // Connection pool settings to prevent "connection terminated" errors
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection cannot be established
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

// Handle pool errors to prevent app crashes
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Handle connection events
pool.on('connect', () => {
  console.log('Database connection established');
});

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
