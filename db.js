// On charge les variables du fichier .env
require('dotenv').config();

// On importe le paquet "pg" (Pool = gestionnaire de connexions)
const { Pool } = require('pg');

// On crée un "pool" de connexions à la base, avec les infos du .env
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// On exporte le pool pour pouvoir l'utiliser ailleurs dans le projet
module.exports = pool;