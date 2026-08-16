# API Blog

API REST pour une plateforme de blog, permettant la gestion d'utilisateurs,
d'articles et de commentaires, avec authentification sécurisée.

Projet réalisé dans le cadre de ma montée en compétences en développement back-end.

## Fonctionnalités

- Inscription et connexion des utilisateurs (authentification par JWT)
- Hachage sécurisé des mots de passe (bcrypt)
- Gestion complète des articles (création, lecture, modification, suppression)
- Gestion des commentaires liés aux articles
- Système d'autorisation : seul l'auteur peut modifier ou supprimer son contenu
- Protection contre les injections SQL (requêtes paramétrées)

## Technologies utilisées

- **Node.js** - environnement d'exécution JavaScript côté serveur
- **Express** - framework web
- **PostgreSQL** - système de gestion de base de données relationnelle
- **pg** - client PostgreSQL pour Node.js
- **bcrypt** - hachage des mots de passe
- **jsonwebtoken (JWT)** - gestion des tokens d'authentification
- **dotenv** - gestion des variables d'environnement

## Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)

## Installation

1. Cloner le dépôt :

```
git clone https://github.com/nicolaskoumakoye/api-blog.git
cd api-blog
```

2. Installer les dépendances :

```
npm install
```

3. Créer la base de données et les tables :

```
psql -U postgres -c "CREATE DATABASE blog;"
psql -U postgres -d blog -f database/schema.sql
```

4. Créer un fichier `.env` à la racine avec les variables suivantes :

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=blog
JWT_SECRET=votre_cle_secrete
```

5. Lancer le serveur :

```
node index.js
```

Le serveur démarre sur `http://localhost:3000`.

## Routes de l'API

### Authentification

| Méthode | Route | Description | Protégée |
|---------|-------|-------------|----------|
| POST | `/api/auth/register` | Inscription d'un utilisateur | Non |
| POST | `/api/auth/login` | Connexion (retourne un token) | Non |

### Articles

| Méthode | Route | Description | Protégée |
|---------|-------|-------------|----------|
| GET | `/api/articles` | Lister tous les articles | Non |
| GET | `/api/articles/:id` | Consulter un article | Non |
| POST | `/api/articles` | Créer un article | Oui |
| PUT | `/api/articles/:id` | Modifier son article | Oui |
| DELETE | `/api/articles/:id` | Supprimer son article | Oui |

### Commentaires

| Méthode | Route | Description | Protégée |
|---------|-------|-------------|----------|
| GET | `/api/articles/:articleId/comments` | Lister les commentaires d'un article | Non |
| POST | `/api/articles/:articleId/comments` | Ajouter un commentaire | Oui |
| DELETE | `/api/comments/:id` | Supprimer son commentaire | Oui |

## Authentification

Les routes protégées nécessitent un token JWT dans l'en-tête de la requête :

Authorization: Bearer <token>

Le token est obtenu lors de la connexion (`/api/auth/login`).

## Conception

La conception détaillée de la base de données (MCD, MLD, modèle relationnel,
normalisation) et le diagramme de cas d'utilisation sont disponibles dans le
document [docs/conception.md](docs/conception.md).

## Auteur

Nicolas Koumakoye