// 1. On importe Express (le framework qu'on a installé)
const express = require('express');

// 2. On crée notre application
const app = express();

// On importe notre connexion à la base
const pool = require('./db');

// Le port sur lequel le serveur va écouter
const PORT = 3000;

// Test de connexion à la base de données
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erreur de connexion à la base :', err.message);
    } else {
        console.log('Connecté à PostgreSQL ! Heure du serveur :', res.rows[0].now);
    }
});

// Permet à Express de lire le JSON envoyé dans les requêtes
app.use(express.json());

// On branche notre routeur d'authentification
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// On branche notre routeur d'articles
const articleRoutes = require('./routes/articles');
app.use('/api/articles', articleRoutes);

// Route de test de base
app.get('/', (req, res) => {
    res.send('Mon API de blog fonctionne 🚀');
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});