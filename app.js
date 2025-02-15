import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.js'; 
import adminRouter from './routes/admin.js';
import pool from './db/db.js';


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', indexRouter);
app.use('/', adminRouter);

app.get('/', async (req, res) => {
    try {
        const result = await pool.query ('SELECT * FROM projects ORDER BY created_at DESC');
        res.render('index', {projects: result.rows});
    }
    catch(err) {
        console.error("Eror", err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
