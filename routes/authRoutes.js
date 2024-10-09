/**
 * @file authRoutes.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

// Pagina di registrazione
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Gestione della registrazione
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (userModel.findUser(username)) {
        return res.status(400).send('Username già esistente');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    userModel.addUser({ username, password: hashedPassword });
    res.redirect('/login');
});

// Pagina di login
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Gestione del login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = userModel.findUser(username);
    if (!user) {
        return res.status(400).send('Credenziali non valide');
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        req.session.loggedIn = true;
        req.session.username = username;
        res.redirect('/upload');
    } else {
        res.status(400).send('Credenziali non valide');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


module.exports = router;