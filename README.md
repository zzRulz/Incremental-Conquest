# Incremental 1v1 – Firebase (frontend only)

Ce dossier contient une version **multijoueur** (1v1) de ton incremental, qui fonctionne **uniquement côté front** grâce à **Firebase Realtime Database**.

## Principe
- J1 clique **Créer** → un **code 4 chiffres** est généré.
- J2 clique **Rejoindre** et saisit le code → la partie commence.
- Tours **alternés** : J1 puis J2.
- Chacun a son **or**, ses **paysans** et **fantassins**. La **grille** est partagée.

## Mise en place Firebase (10 minutes)
1. Va sur [console.firebase.google.com](https://console.firebase.google.com) → **Create project**.
2. Dans le projet : **Build → Realtime Database** → **Create Database** (emplacement `europe-west1` conseillé).
3. **Rules** (règles de sécurité) → colle ceci :
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
> Pour un proto public, ces règles suffisent. Pour de la prod, on mettrait de l’auth + quotas.

4. **Project settings → Your apps → Web app** → **Register app**.
5. Copie la **configuration SDK** (objet `firebaseConfig`).
6. Dans ce dossier, renomme `firebase-config.sample.js` en **`firebase-config.js`** et colle ta config :
```js
export const firebaseConfig = { /* ... tes clés ... */ };
```

## Lancer en local
- Ouvre `index.html` **depuis un serveur local** (sinon certains navigateurs bloquent les modules) :
```bash
python -m http.server 8000
# puis http://localhost:8000
```

## Déployer sur GitHub Pages
- Mets **tous les fichiers à la racine** du dépôt, **y compris** `firebase-config.js`.
- Active Pages (Settings → Pages → Deploy from a branch → main / root).

## Personnalisation
- Le code de salle est un **random 4 chiffres**. Tu peux ajouter un bouton “copier”.
- Les règles Realtime Database peuvent être durcies pour limiter l’écriture à 1 salle / IP / minute, etc.
- Si tu préfères **Supabase** (Postgres + Realtime), c’est possible aussi.

Bon dev & bon jeu !
