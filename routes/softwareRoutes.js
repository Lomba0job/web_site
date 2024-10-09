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
const path = require('path');

// Rotte per il software
router.post('/upload', authMiddleware, (req, res) => {
    uploadController.uploadFile(req, res, 'software');
});

router.get('/version', (req, res) => {
    uploadController.getAllVersions(req, res, 'software');
});

// Rotta per ottenere i dati delle versioni in formato JSON (API)
router.get('/api/all-versions', (req, res) => {
    uploadController.getAllVersions(req, res, 'tool');
});

// Rotta per caricare la pagina all_version.html
router.get('/all-versions', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/all_version.html'));
});

// Serve i file scaricabili
router.use('/downloads', express.static('uploads/software'));

module.exports = router;
