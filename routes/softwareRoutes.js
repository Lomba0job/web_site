/**
 * @file softwareRoutes.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

// routes/softwareRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotte per il software
router.post('/upload', authMiddleware, (req, res) => {
    uploadController.uploadFile(req, res, 'software');
});

router.get('/all-versions', (req, res) => {
    uploadController.getAllVersions(req, res, 'software');
});

router.get('/all-versions', (req, res) => {
    uploadController.getAllVersions(req, res, 'software');
});

// Serve i file scaricabili
router.use('/downloads', express.static('uploads/software'));

module.exports = router;
