import pg from 'pg';

const { Pool } = pg;

const pool = new Pool ({
    user: 'postgres',
    host: 'localhost',
    database: 'my-website',
    password: 'Rawad2004',
    port: 5433,
})

export default {
    query: (text, params) => pool.query(text, params),
};