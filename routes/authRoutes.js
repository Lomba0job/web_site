/**
 * @file authRoutes.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const userModel = require('../models/userModel');

// Pagina di login
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Gestione del login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const isAuthenticated = await userModel.authenticateUser(username, password);

    if (isAuthenticated) {
        req.session.loggedIn = true;
        res.send('Login successful');
    } else {
        res.status(401).send('Invalid username or password');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;