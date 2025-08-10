import express from 'express';
import multer from 'multer';
import db from '../db/db.js';
import bcrypt from 'bcrypt'; 

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }); 

function adminAuth(req, res, next) {
    if (req.session && req.session.isAdmin) {
      return next();
    } else {
      res.redirect('/admin/login');
    }
  }
  


router.get('/admin', adminAuth, async (req, res) => {
    // Render the tile dashboard by default
    const user = { username: process.env.ADMIN_LOGIN || 'Admin', role: 'admin' };
    res.render('admin_dashboard', { user });
});

// Add Project (render form)
router.get('/admin/projects/add', adminAuth, async (req, res) => {
    res.render('admin');
});

// Create Project (form submit)
router.post('/admin', adminAuth, async (req, res) => {
    const { title, description, github_link, live_demo, video_url, background_img, img2, img3, img4, walkthrough_step1, walkthrough_step2, walkthrough_step3 } = req.body;

    const videoUrl = video_url || null;
    const backgroundImageUrl = background_img || null;
    const image2Url = img2 || null;
    const image3Url = img3 || null;
    const image4Url = img4 || null;

    try {
        await db.query(
            `INSERT INTO projects (title, description, github_link, live_demo, video_url, background_img, img2, img3, img4, walkthrough_step1, walkthrough_step2, walkthrough_step3) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [title, description, github_link, live_demo, videoUrl, backgroundImageUrl, image2Url, image3Url, image4Url, walkthrough_step1, walkthrough_step2, walkthrough_step3]
        );
        res.send('Project added successfully!');
    } catch (err) {
        console.error('Error adding project:', err);
        res.status(500).send('Error adding project to the database');
    }
});



router.get('/admin/edit', adminAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects ORDER BY id DESC');
        res.render('admin_project', { projects: result.rows, isAdmin: true }); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching projects');
    }
});

// Manage Projects (alias used by dashboard tile)
router.get('/admin/projects', adminAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects ORDER BY id DESC');
        res.render('admin_project', { projects: result.rows, isAdmin: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching projects');
    }
});

router.get('/admin/edit/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.render('edit', { project: result.rows[0] }); 
        } else {
            res.status(404).send('Project not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching project details');
    }
});

router.post('/admin/edit/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    const { title, description, github_link, live_demo, video_url, background_img, img2, img3, img4, walkthrough_step1, walkthrough_step2, walkthrough_step3 } = req.body;

    try {
        await db.query(
            `UPDATE projects SET title = $1, description = $2, github_link = $3, live_demo = $4, video_url = $5, background_img = $6, img2 = $7, img3 = $8, img4 = $9, walkthrough_step1 = $10, walkthrough_step2 = $11, walkthrough_step3 = $12 WHERE id = $13`,
            [title, description, github_link, live_demo, video_url, background_img, img2, img3, img4, walkthrough_step1, walkthrough_step2, walkthrough_step3, id]
        );
        res.send('Project updated successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating project in the database');
    }
});

// Delete project
router.post('/admin/delete/:id', adminAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM projects WHERE id=$1', [id]);
        res.redirect('/admin/edit');
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).send('Error deleting project');
    }
});

router.get('/admin/login', (req, res) => {
    res.render('admin_login'); 
  });
  
router.post('/admin/login', (req, res) => {
    const { login, password } = req.body;
    const auth = { login: process.env.ADMIN_LOGIN, password: process.env.ADMIN_PASSWORD };
  
    if (login === auth.login && password === auth.password) {
      req.session.isAdmin = true;
      res.redirect('/admin');
    } else {
      res.status(401).send('Invalid credentials');
    }
  });

router.get('/admin/logout', (req, res) => {
    req.session.destroy(err => {
      res.redirect('/admin/login');
    });
  });
  


// Home sections admin
router.get('/admin/home', adminAuth, async (req, res) => {
    try {
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
        const result = await db.query('SELECT * FROM home_sections ORDER BY position, id');
        const sections = result.rows;
        // Seed with defaults if empty
        if (sections.length === 0) {
            const defaults = [
                { title: 'From Data to AI', icon: 'fa-solid fa-brain', content: 'I started in data engineering and warehousing, and I\'m pivoting into AI — building systems that learn and scale.' },
                { title: 'Crafting Beautiful Systems', icon: 'fa-solid fa-code', content: 'I care about developer experience, design, and performance — because great products feel great to use.' },
                { title: 'Shipped and Learning', icon: 'fa-solid fa-robot', content: 'Always shipping, always learning — exploring ML, LLMs, and intelligent automation.' }
            ];
            let pos = 0;
            for (const d of defaults) {
                await db.query('INSERT INTO home_sections(title, content, icon, position, enabled) VALUES($1,$2,$3,$4,TRUE)', [d.title, d.content, d.icon, pos++]);
            }
        }
        const finalRows = (await db.query('SELECT * FROM home_sections ORDER BY position, id')).rows;
        res.render('admin_home', { sections: finalRows });
    } catch (e) {
        console.error(e);
        res.status(500).send('Failed to load home sections');
    }
});

router.post('/admin/home', adminAuth, async (req, res) => {
    try {
        const { id = [], title = [], content = [], icon = [], position = [], enabled = [] } = req.body;
        // Clear all and re-insert based on posted arrays
        await db.query('BEGIN');
        await db.query('TRUNCATE home_sections RESTART IDENTITY');
        const size = Array.isArray(content) ? content.length : (content ? 1 : 0);
        const toArray = (v) => Array.isArray(v) ? v : (size ? [v] : []);
        const titles = toArray(title);
        const contents = toArray(content);
        const icons = toArray(icon);
        const positions = toArray(position).map((p, i) => parseInt(p || i, 10) || i);
        const enabledArr = toArray(enabled).map(v => (v === 'on' || v === 'true' || v === true));
        for (let i = 0; i < size; i++) {
            if (!contents[i]) continue;
            await db.query(
                'INSERT INTO home_sections(title, content, icon, position, enabled) VALUES($1,$2,$3,$4,$5)',
                [titles[i] || null, contents[i], icons[i] || 'fa-solid fa-graduation-cap', positions[i] ?? i, enabledArr[i] ?? true]
            );
        }
        await db.query('COMMIT');
        res.redirect('/admin/home');
    } catch (e) {
        console.error(e);
        await db.query('ROLLBACK');
        res.status(500).send('Failed to save');
    }
});

// About page admin
router.get('/admin/about', adminAuth, async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS about_paragraphs (
        id SERIAL PRIMARY KEY,
        position INTEGER DEFAULT 0,
        content TEXT NOT NULL,
        enabled BOOLEAN DEFAULT TRUE
      );
    `);
    const result = await db.query('SELECT * FROM about_paragraphs ORDER BY position, id');
    res.render('admin_about', { aboutParas: result.rows });
  } catch (e) {
    console.error('Load about admin failed', e);
    res.status(500).send('Failed to load About admin');
  }
});

router.post('/admin/about', adminAuth, async (req, res) => {
  try {
    const { id = [], position = [], content = [], enabled = [] } = req.body;
    const size = Array.isArray(content) ? content.length : (content ? 1 : 0);
    const toArray = v => Array.isArray(v) ? v : (size ? [v] : []);
    const ids = toArray(id);
    const positions = toArray(position).map((p,i)=> parseInt(p||i,10)||i);
    const contents = toArray(content);
    const enabledArr = toArray(enabled).map(v => (v==='on'||v==='true'||v===true));

    await db.query('BEGIN');
    // Strategy: upsert existing ids; insert new rows where id empty and content present
    for (let i=0; i<size; i++) {
      const hasId = ids[i] && String(ids[i]).trim().length>0;
      if (hasId) {
        await db.query('UPDATE about_paragraphs SET position=$1, content=$2, enabled=$3 WHERE id=$4', [positions[i]??i, contents[i]||'', enabledArr[i]??true, ids[i]]);
      } else if ((contents[i]||'').trim()) {
        await db.query('INSERT INTO about_paragraphs(position, content, enabled) VALUES($1,$2,$3)', [positions[i]??i, contents[i], enabledArr[i]??true]);
      }
    }
    await db.query('COMMIT');
    res.redirect('/admin/about');
  } catch (e) {
    console.error('Save about admin failed', e);
    await db.query('ROLLBACK');
    res.status(500).send('Failed to save About');
  }
});

router.post('/admin/about/delete/:id', adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).send('Invalid id');
    await db.query('DELETE FROM about_paragraphs WHERE id=$1', [id]);
    res.redirect('/admin/about');
  } catch (e) {
    console.error('Delete about failed', e);
    res.status(500).send('Failed to delete');
  }
});

// Shared user auth (fiancée or admin)
function userAuth(req, res, next) {
  if ((req.session && req.session.user) || (req.session && req.session.isAdmin)) return next();
  return res.redirect('/fiance/login');
}

// Kanban views (board + new ticket)
router.get('/admin/kanban', userAuth, (req, res) => {
  const backUrl = (req.session.user && req.session.user.role === 'fiancee') ? '/fiance/dashboard' : '/admin';
  res.render('kanban_board', { backUrl });
});

router.get('/admin/ticket/new', userAuth, (req, res) => {
  const backUrl = (req.session.user && req.session.user.role === 'fiancee') ? '/fiance/dashboard' : '/admin';
  res.render('ticket_form', { backUrl });
});

// Fiancée login and dashboard (limited tiles)
router.get('/fiance/login', (req, res) => {
  res.render('fiance_login');
});

router.post('/fiance/login', (req, res) => {
  const { login = '', password = '' } = req.body;
  const expected = {
    login: (process.env.FIANCE_LOGIN || '').trim(),
    password: process.env.FIANCE_PASSWORD || ''
  };
  // Username is case-insensitive, password is case-sensitive
  if (login.trim().toLowerCase() === expected.login.toLowerCase() && password === expected.password) {
    req.session.user = { username: expected.login, role: 'fiancee' };
    return res.redirect('/fiance/dashboard');
  }
  return res.status(401).send('Invalid credentials');
});

router.get('/fiance/dashboard', userAuth, (req, res) => {
  res.render('fiance_dashboard', { user: req.session.user || { username: 'User', role: 'fiancee' } });
});

export default router;
