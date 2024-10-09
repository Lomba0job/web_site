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

// Rotte per gli strumenti (tool)
router.post('/upload', authMiddleware, (req, res) => {
    uploadController.uploadFile(req, res, 'tool');
});

router.get('/version', (req, res) => {
    uploadController.getLatestVersion(req, res, 'tool');
});

router.get('/all-versions', (req, res) => {
    uploadController.getAllVersions(req, res, 'tool');
});

// Serve i file scaricabili
router.use('/downloads', express.static('uploads/tool'));

module.exports = router;