/**
 * @file toolRoutes.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

// routes/toolRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');
const path = require('path');

// Rotte per gli strumenti (tool)
router.post('/upload', authMiddleware, (req, res) => {
    uploadController.uploadFile(req, res, 'tool');
});

router.get('/version', (req, res) => {
    uploadController.getLatestVersion(req, res, 'tool');
});

// Rotta per ottenere i dati delle versioni in formato JSON (API)
router.get('/api/all-versions', authMiddleware, (req, res) => {
    uploadController.getAllVersions(req, res, 'tool');
});

// Rotta per caricare la pagina all_version.html
router.get('/all-versions', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/all_version.html'));
});

// Serve i file scaricabili
router.use('/downloads', express.static('uploads/tool'));

module.exports = router;