/**
 * @file userModel.js
 * @description Gestione utente con nome utente e password fissi
 * @author Lombardi Michele 
 * @copyright Nanolever 
 */


const bcrypt = require('bcrypt');
require('dotenv').config();  // Per caricare le variabili d'ambiente

const users = [];

// Funzione per verificare se l'utente esiste e la password è corretta
const authenticateUser = async (username, password) => {
    const user = users.find(user => user.username === username);
    if (!user) {
        return false;  // Se l'utente non esiste
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    return match;  // Restituisce true se la password è corretta
};

// Aggiungi un utente fisso con nome utente e password hashati
const addFixedUser = () => {
    const username = process.env.USERNAME;
    const passwordHash = process.env.PASSWORD_HASH;

    if (!users.find(user => user.username === username)) {
        users.push({ username, passwordHash });
    }
};

// Chiamare la funzione per aggiungere l'utente fisso una volta all'avvio dell'app
addFixedUser();

module.exports = {
    authenticateUser,
};