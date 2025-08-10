# Conquête Incremental – SPA (Menu Solo / Versus / Paramètres)

Cette version regroupe tout dans **un site** avec un **menu d’accueil** :
- **Solo** : partie contre une **IA simple** (économie par tours).
- **Versus Online** : création / rejoint d’une salle via **code à 4 chiffres** (Firebase RTDB).
- **Paramètres** : taille de la grille, proba, capacité de champs. Sauvegardés en local.

## Fichiers
- `index.html` — les 3 vues (SPA)
- `styles.css` — styles
- `app.js` — logique Solo / Versus / Settings
- `firebase-config.sample.js` — exemple de config Firebase (à copier en `firebase-config.js` si tu veux le online)

## Déploiement GitHub Pages
- Mets ces fichiers **à la racine** du dépôt.
- Si tu veux activer **Versus Online**, ajoute **aussi** `firebase-config.js` (non fourni ici) avec tes clés Firebase.

## Firebase (optionnel, pour Versus)
- Crée un projet, active **Realtime Database**, copie la **config Web** → colle-la dans `firebase-config.js` :
```js
export const firebaseConfig = { /* clés */ };
```
- Règles minimalistes (prototypage) :
```json
{
  "rules": {
    "rooms": {
      "$code": {
        ".read": true,
        ".write": true,
        ".validate": "newData.child('state').exists()"
      }
    }
  }
}
```

Bon jeu !
