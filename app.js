import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import indexRouter from './routes/index.js';
import adminRouter from './routes/admin.js';
import kanbanRouter from './routes/kanban.js';
import db from './db/db.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Trust proxy so secure cookies work behind Render's proxy
app.set('trust proxy', 1);

// Session configuration
const isProd = process.env.NODE_ENV === 'production';
const PgSession = connectPgSimple(session);

const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProd,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
};

// Use Postgres-backed session store in production
if (isProd && process.env.DATABASE_URL) {
    sessionOptions.store = new PgSession({
        conString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        tableName: 'user_sessions',
        createTableIfMissing: true,
    });
}

app.use(session(sessionOptions));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', indexRouter);
app.use('/', adminRouter);
app.use('/', kanbanRouter);

// Healthcheck to verify DB connectivity
app.get('/health/db', async (req, res) => {
    try {
        // Simple roundtrip
        const { rows } = await db.query('SELECT 1 as ok');
        res.status(200).json({ status: 'ok', db: rows[0].ok === 1 ? 'connected' : 'unknown' });
    } catch (e) {
        console.error('DB healthcheck failed:', e);
        res.status(500).json({ status: 'error', message: 'database connection failed' });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
