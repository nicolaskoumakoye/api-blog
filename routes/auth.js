const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Route d'inscription : POST /register
router.post('/register', async (req, res) => {
    try {
        // 1. On récupère les données envoyées par l'utilisateur
        const { name, email, password } = req.body;

        // 2. On vérifie que tout est bien fourni
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }

        // 3. On hashe le mot de passe (10 = niveau de sécurité)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. On insère le nouvel utilisateur dans la base
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );

        // 5. On renvoie l'utilisateur créé (sans le mot de passe !)
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: result.rows[0]
        });

    } catch (error) {
        // Si l'email existe déjà, ou autre erreur
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du compte' });
    }
});


// Route de connexion : POST /login
router.post('/login', async (req, res) => {
    try {
        // 1. On récupère email et mot de passe
        const { email, password } = req.body;

        // 2. On vérifie que les deux sont fournis
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe obligatoires' });
        }

        // 3. On cherche l'utilisateur par son email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        // 4. Si aucun utilisateur trouvé
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = result.rows[0];

        // 5. On compare le mot de passe fourni avec le hash stocké
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // 6. Mot de passe correct : on génère un token JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 7. On renvoie le token
        res.json({
            message: 'Connexion réussie',
            token: token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});

module.exports = router;