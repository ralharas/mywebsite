import express from 'express';
import db from '../db/db.js';

const router = express.Router();

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

export default router;
