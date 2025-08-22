# Visualisation de la Carte du Cameroun

Ce projet est une application web interactive développée avec Next.js pour la visualisation de données géographiques et administratives du Cameroun. Elle permet d'afficher différentes couches de données, comme les régions, les départements et les arrondissements, sur une carte interactive.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Démarrage Rapide](#démarrage-rapide)
- [Structure du Projet](#structure-du-projet)
- [Sources des Données](#sources-des-données)
- [Comment Contribuer](#comment-contribuer)

## Fonctionnalités

- **Carte Interactive** : Affiche une carte du Cameroun sur laquelle on peut naviguer.
- **Couches de Données** : Superposition des limites administratives (départements, arrondissements) grâce aux fichiers GeoJSON.
- **Interface Moderne** : Interface utilisateur épurée et responsive construite avec React, Tailwind CSS et Shadcn/UI.
- **Personnalisation du Thème** : Support des thèmes clair et sombre.
- **Upload d'Images** : Composant disponible pour permettre l'import d'images (fonctionnalité à développer).

## Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) (React)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Style** : [Tailwind CSS](https://tailwindcss.com/)
- **Composants UI** : [Shadcn/UI](https://ui.shadcn.com/)
- **Gestionnaire de paquets** : [pnpm](https://pnpm.io/)
- **Bibliothèque de cartographie** : (Probablement [Leaflet](https://leafletjs.com/), [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/) ou une autre bibliothèque React de cartographie)

## Démarrage Rapide

Suivez ces étapes pour lancer le projet en local.

### Prérequis

- [Node.js](https://nodejs.org/en/) (version 18.x ou supérieure)
- [pnpm](https://pnpm.io/installation)

### Installation

1.  Clonez le dépôt sur votre machine locale :
    ```bash
    git clone <URL_DU_REPO>
    ```

2.  Naviguez dans le répertoire du projet :
    ```bash
    cd cameroon-map-viz
    ```

3.  Installez les dépendances :
    ```bash
    pnpm install
    ```

### Lancement

1.  Lancez le serveur de développement :
    ```bash
    pnpm dev
    ```

2.  Ouvrez votre navigateur et allez à l'adresse [http://localhost:3000](http://localhost:3000).

## Structure du Projet

```
/
├── app/                # Pages et layouts de l'application (App Router)
│   ├── globals.css     # Styles globaux
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Page d'accueil
├── components/         # Composants React réutilisables
│   ├── data/           # Fichiers de données GeoJSON
│   ├── ui/             # Composants de base de Shadcn/UI
│   ├── map-container.tsx # Composant principal de la carte
│   └── sidebar.tsx     # Composant de la barre latérale
├── public/             # Fichiers statiques (images, logos)
├── lib/                # Fonctions et utilitaires
├── next.config.mjs     # Fichier de configuration de Next.js
└── package.json        # Dépendances et scripts du projet
```

## Sources des Données

Les données géographiques utilisées pour délimiter les zones administratives du Cameroun sont au format **GeoJSON**. Elles sont stockées dans le répertoire `components/data/`. Ces fichiers sont essentiels au rendu des différentes couches sur la carte.

## Comment Contribuer

Les contributions sont les bienvenues ! Si vous souhaitez améliorer ce projet, veuillez suivre les étapes suivantes :

1.  Forkez le projet.
2.  Créez une nouvelle branche (`git checkout -b feature/amélioration-x`).
3.  Commitez vos changements (`git commit -m 'Ajout de la fonctionnalité X'`).
4.  Poussez votre branche (`git push origin feature/amélioration-x`).
5.  Ouvrez une Pull Request.
