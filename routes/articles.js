const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /articles : lister tous les articles (public)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM articles ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des articles' });
    }
});

// GET /articles/:id : voir un article précis (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM articles WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'article' });
    }
});

// POST /articles : créer un article (protégé — connecté requis)
router.post('/', authMiddleware, async (req, res) => {
    try {
        // 1. On récupère le titre et le contenu envoyés
        const { title, content } = req.body || {};

        // 2. On vérifie qu'ils sont fournis
        if (!title || !content) {
            return res.status(400).json({ error: 'Titre et contenu obligatoires' });
        }

        // 3. On insère l'article (author_id vient du token, via le middleware !)
        const result = await pool.query(
            'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
            [title, content, req.userId]
        );

        // 4. On renvoie l'article créé
        res.status(201).json({
            message: 'Article créé avec succès',
            article: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'article' });
    }
});

module.exports = router;