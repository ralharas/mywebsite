import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

/*const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'my-website',
  password: 'rawad2003',
  port: 5433,
});
export default {
  query: (text, params) => pool.query(text, params),
};*/

import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    user: 'my_website_user',
    host: 'dpg-cr4964rtq21c73e0qmcg-a',
    database: 'my_website_y4et',
    password: 'z7gI5uZzaUAXj5iimqr5GfsbcKNINlrZ',
    port: 5432, 
});

export default pool;