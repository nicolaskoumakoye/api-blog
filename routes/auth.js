const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

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

module.exports = router;