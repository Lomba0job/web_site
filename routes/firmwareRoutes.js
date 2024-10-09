/**
 * @file firmwareRoutes.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

// routes/firmwareRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotte per il firmware
router.post('/upload', authMiddleware, (req, res) => {
    uploadController.uploadFile(req, res, 'firmware');
});

router.get('/version', (req, res) => {
    uploadController.getLatestVersion(req, res, 'firmware');
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
router.use('/downloads', express.static('uploads/firmware'));

module.exports = router;