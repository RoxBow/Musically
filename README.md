# Musically

Application pour s'enregistrer en train de chanter et avoir son historique de musique

## Installation

Installer les dépendances du dossier app & server

```sh
yarn
```

Installer json server en global

## Lancer le project

Lancer l'émulateur iOS dans le dossier app

```sh
yarn ios
```

puis lancer dans un autre terminal la base de donnée dans le dossier server

```sh
yarn db
```

## Explication

L'utilisateur a sur l'onglet 'Songs' la liste des sons qu'il a enregistré
Sur l'onglet 'Lyrics', il a la possibilité de rechercher les paroles d'une musique et s'enregistrer

## Technique

- React Navigation (routing)
- Json server (base de donnée)
- Expo