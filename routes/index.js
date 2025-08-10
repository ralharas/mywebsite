import express from 'express';
import db from '../db/db.js';

const router = express.Router();

// Root route - main page
router.get('/', async (req, res) => {
    try {
        // Ensure table exists and fetch enabled sections
        await db.query(`
            CREATE TABLE IF NOT EXISTS home_sections (
                id SERIAL PRIMARY KEY,
                title TEXT,
                content TEXT NOT NULL,
                icon VARCHAR(64) DEFAULT 'fa-solid fa-graduation-cap',
                position INTEGER DEFAULT 0,
                enabled BOOLEAN DEFAULT TRUE
            );
        `);
        let result = await db.query(
            'SELECT id, title, content, icon, position, enabled FROM home_sections WHERE enabled = TRUE ORDER BY position, id'
        );
        let homeSections = result.rows || [];
        // Seed tasteful defaults if empty so homepage scroll always works
        if (homeSections.length === 0) {
            const defaults = [
                { title: 'Data and Machine Learning', icon: 'fa-solid fa-brain', content: 'I enjoy working across data systems and machine learning—designing pipelines, shaping datasets, and building ML features that are useful and elegant.' },
                { title: 'Crafting Beautiful Systems', icon: 'fa-solid fa-code', content: 'I care about developer experience, clarity, and performance—because great products feel great to use.' },
                { title: 'Shipped and Learning', icon: 'fa-solid fa-robot', content: 'Always shipping, always learning—exploring modern ML, LLMs, automation, and the tooling that makes teams faster.' }
            ];
            let pos = 0;
            for (const d of defaults) {
                await db.query('INSERT INTO home_sections(title, content, icon, position, enabled) VALUES($1,$2,$3,$4,TRUE)', [d.title, d.content, d.icon, pos++]);
            }
            result = await db.query(
                'SELECT id, title, content, icon, position, enabled FROM home_sections WHERE enabled = TRUE ORDER BY position, id'
            );
            homeSections = result.rows || [];
        }
        res.render('index', { homeSections });
    } catch (e) {
        console.error('Error loading home sections', e);
        res.render('index', { homeSections: [] });
    }
});

router.get('/projects', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects ORDER BY id DESC');
        res.render('projects', { projects: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching projects from the database');
    }
});

router.get('/projects/:id', async (req, res) => {
    const { id } = req.params;
    const isAdmin = req.user && req.user.isAdmin ? req.user.isAdmin : false;
    try {
        const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.render('project', { project: result.rows[0]});
        } else {
            res.status(404).send('Project not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching project details');
    }
});

// About page route
router.get('/about', (req, res) => {
    res.render('about');
});

// Contact page route
router.get('/contact', (req, res) => {
    res.render('contact');
});

export default router;
