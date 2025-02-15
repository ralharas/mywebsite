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

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/admin/login');
}

router.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin');
});

router.post('/admin', isAuthenticated, async (req, res) => {
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
        res.status(500).send('Error adding project to the database');
    }
});

router.get('/admin/edit', isAuthenticated, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM projects ORDER BY id DESC');
        res.render('admin_project', { projects: result.rows, isAdmin: true });
    } catch (err) {
        res.status(500).send('Error fetching projects');
    }
});

router.get('/admin/edit/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.render('edit', { project: result.rows[0] });
        } else {
            res.status(404).send('Project not found');
        }
    } catch (err) {
        res.status(500).send('Error fetching project details');
    }
});

router.post('/admin/edit/:id', isAuthenticated, upload.fields([{ name: 'background_img' }, { name: 'img2' }, { name: 'img3' }, { name: 'img4' }]), async (req, res) => {
    const { id } = req.params;
    const { title, description, github_link, live_demo, video_url, walkthrough_step1, walkthrough_step2, walkthrough_step3 } = req.body;
    const background_img = req.files['background_img'] ? `/uploads/${req.files['background_img'][0].filename}` : req.body.existing_background_img;
    const img2 = req.files['img2'] ? `/uploads/${req.files['img2'][0].filename}` : req.body.existing_img2;
    const img3 = req.files['img3'] ? `/uploads/${req.files['img3'][0].filename}` : req.body.existing_img3;
    const img4 = req.files['img4'] ? `/uploads/${req.files['img4'][0].filename}` : req.body.existing_img4;
    const videoUrl = video_url || req.body.existing_video_url;

    try {
        await db.query(
            `UPDATE projects 
             SET title = $1, description = $2, github_link = $3, live_demo = $4, video_url = $5, background_img = $6, img2 = $7, img3 = $8, img4 = $9, walkthrough_step1 = $10, walkthrough_step2 = $11, walkthrough_step3 = $12 
             WHERE id = $13`,
            [title, description, github_link, live_demo, videoUrl, background_img, img2, img3, img4, walkthrough_step1, walkthrough_step2, walkthrough_step3, id]
        );
        res.send('Project updated successfully!');
    } catch (err) {
        res.status(500).send('Error updating project in the database');
    }
});

export default router;
