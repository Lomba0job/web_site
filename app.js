/**
 * @file app.js
 * @description 
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */

// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
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

// Server HTTPS
const sslOptions = {
    key: fs.readFileSync('/home/lmb/ssl/privkey.pem'),
    cert: fs.readFileSync('/home/lmb/ssl/fullchain.pem')
};

https.createServer(sslOptions, app).listen(443, () => {
    console.log('Server HTTPS in ascolto sulla porta 443');
});
/*
// Server HTTP per reindirizzare a HTTPS
http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80, () => {
    console.log('Server HTTP in ascolto sulla porta 80 e reindirizza a HTTPS');
});
*/

// Imposta una porta non privilegiata (ad esempio, 3000)
const HTTPS_PORT = 3000;

https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`Server HTTPS in ascolto sulla porta ${HTTPS_PORT}`);
});