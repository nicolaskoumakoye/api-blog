const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /articles/:articleId/comments : lister les commentaires d'un article (public)
router.get('/articles/:articleId/comments', async (req, res) => {
    try {
        const { articleId } = req.params;
        const result = await pool.query(
            'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC',
            [articleId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
    }
});

// POST /articles/:articleId/comments : ajouter un commentaire (protégé)
router.post('/articles/:articleId/comments', authMiddleware, async (req, res) => {
    try {
        const { articleId } = req.params;
        const { content } = req.body || {};

        // 1. On vérifie que le contenu est fourni
        if (!content) {
            return res.status(400).json({ error: 'Le contenu du commentaire est obligatoire' });
        }

        // 2. On vérifie que l'article existe
        const article = await pool.query('SELECT * FROM articles WHERE id = $1', [articleId]);
        if (article.rows.length === 0) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        // 3. On insère le commentaire (author_id vient du token, article_id de l'URL)
        const result = await pool.query(
            'INSERT INTO comments (content, author_id, article_id) VALUES ($1, $2, $3) RETURNING *',
            [content, req.userId, articleId]
        );

        res.status(201).json({
            message: 'Commentaire ajouté avec succès',
            comment: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
    }
});

// DELETE /comments/:id : supprimer un commentaire (protégé + seul l'auteur)
router.delete('/comments/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. On récupère le commentaire concerné
        const existing = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Commentaire non trouvé' });
        }

        // 2. On vérifie que l'utilisateur est bien l'auteur (AUTORISATION)
        if (existing.rows[0].author_id !== req.userId) {
            return res.status(403).json({ error: 'Vous n\'êtes pas l\'auteur de ce commentaire' });
        }

        // 3. On supprime le commentaire
        await pool.query('DELETE FROM comments WHERE id = $1', [id]);

        res.json({ message: 'Commentaire supprimé avec succès' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
    }
});

module.exports = router;