// 1. On importe Express (le framework qu'on a installé)
const express = require('express');

// 2. On crée notre application
const app = express();
// On importe notre connexion à la base
const pool = require('./db');

// Test de connexion à la base de données
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erreur de connexion à la base :', err.message);
    } else {
        console.log('Connecté à PostgreSQL ! Heure du serveur :', res.rows[0].now);
    }
});

// 3. On définit le "port" sur lequel le serveur va écouter
const PORT = 3000;

// 4. On crée une première route : quand quelqu'un visite "/", on répond
app.get('/', (req, res) => {
  res.send('Bonjour ! Mon API de blog fonctionne 🚀');
});

// 5. On démarre le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});