import express from 'express';
import db from '../db/db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Middleware to check if user is authenticated
function authCheck(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// API Routes for Kanban

// Get all columns
router.get('/api/kanban/columns', authCheck, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM kanban_columns ORDER BY position');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching columns:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new column
router.post('/api/kanban/columns', authCheck, async (req, res) => {
    const { name } = req.body;
    
    try {
        // Get the highest position
        const posResult = await db.query('SELECT MAX(position) as max_pos FROM kanban_columns');
        const newPosition = (posResult.rows[0].max_pos || 0) + 1;
        
        const result = await db.query(
            'INSERT INTO kanban_columns (name, position) VALUES ($1, $2) RETURNING *',
            [name, newPosition]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating column:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all tickets
router.get('/api/kanban/tickets', authCheck, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT t.*, u.username as created_by_name 
            FROM tickets t 
            LEFT JOIN users u ON t.created_by = u.id 
            ORDER BY t.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new ticket
router.post('/api/kanban/tickets', authCheck, async (req, res) => {
    const { title, description, priority, column_id } = req.body;
    const userId = req.session.user.id;
    
    try {
        // If no column_id provided, use the first column
        let targetColumnId = column_id;
        if (!targetColumnId) {
            const firstColumn = await db.query('SELECT id FROM kanban_columns ORDER BY position LIMIT 1');
            targetColumnId = firstColumn.rows[0].id;
        }
        
        const result = await db.query(
            `INSERT INTO tickets (title, description, priority, column_id, created_by) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, description, priority || 'medium', targetColumnId, userId]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Move ticket to different column
router.put('/api/kanban/tickets/:id/move', authCheck, async (req, res) => {
    const { id } = req.params;
    const { column_id } = req.body;
    
    try {
        const result = await db.query(
            'UPDATE tickets SET column_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [column_id, id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error moving ticket:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update ticket
router.put('/api/kanban/tickets/:id', authCheck, async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, assigned_to } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE tickets 
             SET title = $1, description = $2, priority = $3, assigned_to = $4, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 RETURNING *`,
            [title, description, priority, assigned_to, id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete ticket
router.delete('/api/kanban/tickets/:id', authCheck, async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM tickets WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
