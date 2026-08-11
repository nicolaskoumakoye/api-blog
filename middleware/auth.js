const jwt = require('jsonwebtoken');

// Middleware qui vérifie le token JWT
function authMiddleware(req, res, next) {
    // 1. On récupère le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;

    // 2. On vérifie qu'un token est bien présent
    if (!authHeader) {
        return res.status(401).json({ error: 'Token manquant, accès refusé' });
    }

    // 3. Le token arrive sous la forme "Bearer LE_TOKEN" : on extrait juste le token
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token invalide' });
    }

    // 4. On vérifie que le token est authentique
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // On attache les infos de l'utilisateur à la requête
        req.userId = decoded.userId;
        // On laisse passer vers la route
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
}

module.exports = authMiddleware;