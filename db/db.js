import pg from 'pg';
import dotenv from 'dot-env';


const { Pool } = pg;
dotenv.config();

const pool = new Pool ({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
})

export default {
    query: (text, params) => pool.query(text, params),
};