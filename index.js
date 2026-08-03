// 1. On importe Express (le framework qu'on a installé)
const express = require('express');

// 2. On crée notre application
const app = express();

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