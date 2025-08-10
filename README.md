# Conquête – Version multipage (menu/solo/versus/settings)

## Fichiers
- `menu.html` — menu vertical (Solo / Versus Online / Paramètres)
- `solo.html` — mode solo vs IA
- `versus.html` — mode en ligne 1v1 (Firebase Realtime Database)
- `settings.html` — options de base (taille, proba, capacité de champs)
- `styles.css` — style commun
- `game-solo.js` — logique du mode solo
- `game-versus.js` — logique du mode versus
- `firebase-config.sample.js` — exemple de config Firebase (à copier en `firebase-config.js`)

## Déploiement GitHub Pages
- Mets **tous les fichiers à la racine** du dépôt.
- L’URL d’accueil sera généralement `https://<user>.github.io/<repo>/menu.html` (ou renomme `menu.html` en `index.html` si tu veux que ce soit l’accueil par défaut).

## Activer le versus (Firebase)
1. Crée un projet Firebase → active **Realtime Database** (région `europe-west1` conseillée).
2. Récupère le bloc `firebaseConfig` (app Web) et crée un fichier `firebase-config.js` à la **racine** du dépôt :
```js
export const firebaseConfig = { /* tes clés */ };
```
3. Dans RTDB → **Rules** → publie des règles minimales (prototypage) :
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
4. Recharge `versus.html`, clique **Créer** pour obtenir un code 4 chiffres.

Bon jeu !
