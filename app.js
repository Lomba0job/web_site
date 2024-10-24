/**
 * @file app.js
 * @description 
 * @author Lombardi Michele 
 */

// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const https = require('https');
const fs = require('fs');

const app = express();

// Middleware per analizzare i dati del corpo della richiesta
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurazione della sessione
app.use(session({
    secret: 'tuoSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Rotte statiche
app.use(express.static(path.join(__dirname, 'public')));

// Importazione delle rotte
const softwareRoutes = require('./routes/softwareRoutes');
const firmwareRoutes = require('./routes/firmwareRoutes');
const toolRoutes = require('./routes/toolRoutes');
const authRoutes = require('./routes/authRoutes');

// Utilizzo delle rotte
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/software', softwareRoutes);
app.use('/firmware', firmwareRoutes);
app.use('/tool', toolRoutes);
app.use('/', authRoutes); // Rotte di autenticazione

// Middleware per rimuovere l'estensione .html dalle URL
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', `${page}.html`);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            next();
        } else {
            res.sendFile(filePath);
        }
    });
});
// Gestione del favicon.ico per evitare errori
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Middleware per gestire gli errori
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Si è verificato un errore interno del server!');
});
// Opzioni SSL
const sslOptions = {
    key: fs.readFileSync('/home/lmb/ssl/privkey.pem'),
    cert: fs.readFileSync('/home/lmb/ssl/fullchain.pem')
};

// Imposta il server HTTPS su una porta non privilegiata (ad esempio, 3000)
const HTTPS_PORT = 3000;

https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`Server HTTPS in ascolto sulla porta ${HTTPS_PORT}`);
});