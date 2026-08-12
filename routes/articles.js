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

// PUT /articles/:id : modifier un article (protégé + seul l'auteur)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body || {};

        // 1. On vérifie que les données sont fournies
        if (!title || !content) {
            return res.status(400).json({ error: 'Titre et contenu obligatoires' });
        }

        // 2. On récupère l'article concerné
        const existing = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        // 3. On vérifie que l'utilisateur est bien l'auteur (AUTORISATION)
        if (existing.rows[0].author_id !== req.userId) {
            return res.status(403).json({ error: 'Vous n\'êtes pas l\'auteur de cet article' });
        }

        // 4. On modifie l'article
        const result = await pool.query(
            'UPDATE articles SET title = $1, content = $2 WHERE id = $3 RETURNING *',
            [title, content, id]
        );

        res.json({
            message: 'Article modifié avec succès',
            article: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la modification' });
    }
});

// DELETE /articles/:id : supprimer un article (protégé + seul l'auteur)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. On récupère l'article concerné
        const existing = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        // 2. On vérifie que l'utilisateur est bien l'auteur (AUTORISATION)
        if (existing.rows[0].author_id !== req.userId) {
            return res.status(403).json({ error: 'Vous n\'êtes pas l\'auteur de cet article' });
        }

        // 3. On supprime l'article
        await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        
        res.json({ message: 'Article supprimé avec succès' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

module.exports = router;