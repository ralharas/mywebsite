import express from 'express';
import multer from 'multer';
import db from '../db/db.js'; 

const router = express.Router();


router.use('/admin', (req, res, next) => {
    const auth = { login: process.env.ADMIN_LOGIN, password: process.env.ADMIN_PASSWORD }; 

    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    if (login && password && login === auth.login && password === auth.password) {
        req.isAuthenticated = true;
        req.user = { isAdmin: true };
        return next(); 
    }

   
    res.set('WWW-Authenticate', 'Basic realm="401"'); 
    res.status(401).send('Authentication required.'); 
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


router.get('/admin', (req, res) => {
    if (!req.isAuthenticated) {
        return res.status(401).send('Authentication required.');
    }
    res.render('admin'); 
});


router.post('/admin', upload.fields([{ name: 'background_img' }, { name: 'img2' }, { name: 'img3' }, { name: 'img4' }]), async (req, res) => {
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

export default router;
