# Coupe Optimale Maroc

Application d'optimisation de découpe de panneaux.

## Fonctionnalités

- Optimisation de découpe de panneaux
- Visualisation des plans de découpe
- Sauvegarde et chargement de projets
- Export en CSV, PNG et PDF

## Installation

```bash
# Installer les dépendances du client
npm install

# Installer les dépendances du serveur
cd server
npm install
cd ..
```

## Démarrage

Pour démarrer l'application complète (client + serveur) :

```bash
npm run dev:full
```

Pour démarrer uniquement le client :

```bash
npm run dev
```

Pour démarrer uniquement le serveur :

```bash
npm run server
```

## Stockage des données

L'application utilise une base de données SQLite pour stocker les projets. La base de données est créée automatiquement dans le dossier suivant :

- Windows : `%APPDATA%\coupe-optimale-maroc\projects.db`
- macOS : `~/Library/Application Support/coupe-optimale-maroc/projects.db`
- Linux : `~/.local/share/coupe-optimale-maroc/projects.db`

## Technologies utilisées

- Vite
- TypeScript
- React
- Express
- SQLite (better-sqlite3)
- shadcn/ui
- Tailwind CSS
