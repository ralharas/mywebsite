import express from 'express';
import db from '../db/db.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Middleware to check if user is authenticated (fiancée or admin)
function authCheck(req, res, next) {
    if (req.session && (req.session.user || req.session.isAdmin)) {
        return next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Ensure schema exists and seed defaults
async function ensureKanbanSchema() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS kanban_columns (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            position INTEGER DEFAULT 0
        );
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS tickets (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT DEFAULT 'medium',
            column_id INTEGER REFERENCES kanban_columns(id) ON DELETE SET NULL,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS ticket_comments (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
            author TEXT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS ticket_activity (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM kanban_columns');
    if (rows[0].count === 0) {
        // Seed default columns
        await db.query('INSERT INTO kanban_columns(name, position) VALUES ($1,$2), ($3,$4), ($5,$6)', [
            'To Do', 0, 'In Progress', 1, 'Done', 2
        ]);
    }
}

// Email helper
let transporter = null;
function getTransporter() {
    if (transporter) return transporter;
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
    }
    return transporter;
}

async function sendFianceEmail(subject, text) {
    const to = process.env.FIANCE_EMAIL;
    if (!to) return; // No email configured yet
    try {
        const t = getTransporter();
        if (!t) {
            console.log('Email transport not configured. Skipping email:', subject);
            return;
        }
        await t.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@localhost',
            to,
            subject,
            text,
        });
    } catch (e) {
        console.error('Failed to send email', e);
    }
}

// Page auth for HTML views
function userAuthPage(req, res, next) {
    if (req.session && (req.session.user || req.session.isAdmin)) return next();
    return res.redirect('/fiance/login');
}

// API Routes for Kanban

// Get all columns
router.get('/api/kanban/columns', authCheck, async (req, res) => {
    try {
        await ensureKanbanSchema();
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
        await ensureKanbanSchema();
        // Get the highest position
        const posResult = await db.query('SELECT COALESCE(MAX(position), -1) as max_pos FROM kanban_columns');
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
        await ensureKanbanSchema();
        const result = await db.query(`
            SELECT t.*
            FROM tickets t 
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
    const userId = (req.session.user && req.session.user.id) ? req.session.user.id : null;
    const authorName = (req.session.user && req.session.user.username) ? req.session.user.username : (req.session.isAdmin ? 'Admin' : 'User');
    
    try {
        await ensureKanbanSchema();
        // If no column_id provided, use the first column
        let targetColumnId = column_id;
        if (!targetColumnId) {
            const firstColumn = await db.query('SELECT id, name FROM kanban_columns ORDER BY position LIMIT 1');
            targetColumnId = firstColumn.rows[0]?.id;
        }
        
        const result = await db.query(
            `INSERT INTO tickets (title, description, priority, column_id, created_by) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, description, (priority || 'medium'), targetColumnId, userId]
        );
        const ticket = result.rows[0];

        // Activity log: created
        await db.query('INSERT INTO ticket_activity(ticket_id, type, details) VALUES ($1,$2,$3)', [
            ticket.id, 'created', `${authorName} created the ticket in column ID ${ticket.column_id} with priority ${ticket.priority}`
        ]);

        // Email notification (async, do not block response)
        sendFianceEmail(`New ticket #${ticket.id} submitted: ${ticket.title}`, `A new ticket was submitted.\n\nTitle: ${ticket.title}\nPriority: ${ticket.priority}`);
        
        res.json(ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Move ticket to different column
router.put('/api/kanban/tickets/:id/move', authCheck, async (req, res) => {
    const { id } = req.params;
    const { column_id } = req.body;
    const actor = (req.session.user && req.session.user.username) ? req.session.user.username : (req.session.isAdmin ? 'Admin' : 'User');
    
    try {
        await ensureKanbanSchema();
        // Get old column
        const oldRes = await db.query('SELECT column_id, title FROM tickets WHERE id=$1', [id]);
        const oldColumnId = oldRes.rows[0]?.column_id;
        const oldCol = oldColumnId ? await db.query('SELECT name FROM kanban_columns WHERE id=$1', [oldColumnId]) : { rows: [{ name: 'Unknown' }] };
        const newCol = await db.query('SELECT name FROM kanban_columns WHERE id=$1', [column_id]);

        const result = await db.query(
            'UPDATE tickets SET column_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [column_id, id]
        );
        const ticket = result.rows[0];

        // Activity log
        await db.query('INSERT INTO ticket_activity(ticket_id, type, details) VALUES ($1,$2,$3)', [
            ticket.id, 'moved', `${actor} moved the ticket from "${oldCol.rows[0]?.name || 'Unknown'}" to "${newCol.rows[0]?.name || 'Unknown'}"`
        ]);
        // Email notification (async, do not block response)
        sendFianceEmail(`Ticket #${ticket.id} moved: ${ticket.title}`, `The ticket was moved from ${oldCol.rows[0]?.name || 'Unknown'} to ${newCol.rows[0]?.name || 'Unknown'}.`);
        
        res.json(ticket);
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
        await ensureKanbanSchema();
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
// Add comment
router.post('/api/kanban/tickets/:id/comments', authCheck, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const author = (req.session.user && req.session.user.username) ? req.session.user.username : (req.session.isAdmin ? 'Admin' : 'User');
    try {
        await ensureKanbanSchema();
        const ins = await db.query('INSERT INTO ticket_comments(ticket_id, author, content) VALUES ($1,$2,$3) RETURNING *', [id, author, content]);
        await db.query('INSERT INTO ticket_activity(ticket_id, type, details) VALUES ($1,$2,$3)', [id, 'commented', `${author} commented: ${content.substring(0,140)}`]);
        const tinfo = await db.query('SELECT title FROM tickets WHERE id=$1', [id]);
        // Email notification (async, do not block response)
        sendFianceEmail(`New comment on ticket #${id}: ${tinfo.rows[0]?.title || ''}`, `${author} commented:\n\n${content}`);
        res.json(ins.rows[0]);
    } catch (e) {
        console.error('Error adding comment', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ticket detail page
router.get('/admin/tickets/:id', userAuthPage, async (req, res) => {
    const { id } = req.params;
    try {
        await ensureKanbanSchema();
        const ticketRes = await db.query('SELECT t.*, c.name as column_name FROM tickets t LEFT JOIN kanban_columns c ON c.id = t.column_id WHERE t.id=$1', [id]);
        if (ticketRes.rows.length === 0) return res.status(404).send('Ticket not found');
        const ticket = ticketRes.rows[0];
        const comments = (await db.query('SELECT * FROM ticket_comments WHERE ticket_id=$1 ORDER BY created_at ASC', [id])).rows;
        const activity = (await db.query('SELECT * FROM ticket_activity WHERE ticket_id=$1 ORDER BY created_at DESC', [id])).rows;
        res.render('ticket_detail', { ticket, comments, activity });
    } catch (e) {
        console.error('Error loading ticket', e);
        res.status(500).send('Failed to load ticket');
    }
});

// Delete ticket
router.delete('/api/kanban/tickets/:id', authCheck, async (req, res) => {
    const { id } = req.params;
    
    try {
        await ensureKanbanSchema();
        await db.query('DELETE FROM tickets WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
