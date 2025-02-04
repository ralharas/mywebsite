import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});
export default {
  query: (text, params) => pool.query(text, params),
};

/*import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'my-website',
    password: '',
    port: 5433, 
});

export default pool;*/