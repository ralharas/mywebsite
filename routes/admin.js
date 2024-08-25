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
    const auth = { login: process.env.ADMIN_LOGIN, password: process.env.ADMIN_PASSWORD }; 

    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    
    if (login && password && login === auth.login && password === auth.password) {
        req.isAuthenticated = true;  
        req.user = { isAdmin: true }; 
        return next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm="401"'); 
        return res.status(401).send('Authentication required.');
    }
}


router.get('/admin', adminAuth, (req, res) => {
    res.render('admin'); 
});

router.post('/admin', adminAuth, upload.fields([{ name: 'background_img' }, { name: 'img2' }, { name: 'img3' }, { name: 'img4' }]), async (req, res) => {
    const { title, description, github_link, live_demo, walkthrough_step1, walkthrough_step2, walkthrough_step3 } = req.body;
    const background_img = req.files['background_img'] ? `/uploads/${req.files['background_img'][0].filename}` : null;
    const img2 = req.files['img2'] ? `/uploads/${req.files['img2'][0].filename}` : null;
    const img3 = req.files['img3'] ? `/uploads/${req.files['img3'][0].filename}` : null;
    const img4 = req.files['img4'] ? `/uploads/${req.files['img4'][0].filename}` : null;

    try {
        await db.query(
            'INSERT INTO projects (title, description, github_link, live_demo, background_img, img2, img3, img4, walkthrough_step1, walkthrough_step2, walkthrough_step3) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [title, description, github_link, live_demo, background_img, img2, img3, img4, walkthrough_step1, walkthrough_step2, walkthrough_step3]
        );
        res.send('Project added successfully!');
    } catch (err) {
        console.error(err);
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

router.post('/admin/edit/:id', adminAuth, upload.fields([{ name: 'background_img' }, { name: 'img2' }, { name: 'img3' }, { name: 'img4' }]), async (req, res) => {
    const { id } = req.params;
    const { title, description, github_link, live_demo, walkthrough_step1, walkthrough_step2, walkthrough_step3 } = req.body;
    const background_img = req.files['background_img'] ? `/uploads/${req.files['background_img'][0].filename}` : req.body.existing_background_img;
    const img2 = req.files['img2'] ? `/uploads/${req.files['img2'][0].filename}` : req.body.existing_img2;
    const img3 = req.files['img3'] ? `/uploads/${req.files['img3'][0].filename}` : req.body.existing_img3;
    const img4 = req.files['img4'] ? `/uploads/${req.files['img4'][0].filename}` : req.body.existing_img4;

    try {
        await db.query(
            'UPDATE projects SET title = $1, description = $2, github_link = $3, live_demo = $4, background_img = $5, img2 = $6, img3 = $7, img4 = $8, walkthrough_step1 = $9, walkthrough_step2 = $10, walkthrough_step3 = $11 WHERE id = $12',
            [title, description, github_link, live_demo, background_img, img2, img3, img4, walkthrough_step1, walkthrough_step2, walkthrough_step3, id]
        );
        res.send('Project updated successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating project in the database');
    }
});

export default router;
