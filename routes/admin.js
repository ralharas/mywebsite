import express from 'express';
import multer from 'multer';
import db from '../db/db.js'; 

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
  


router.get('/admin', adminAuth, (req, res) => {
    res.render('admin'); 
});


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
  


export default router;
