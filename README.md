# Incremental – Châteaux & Champs

Jeu incremental par tours (HTML/CSS/JS).

## Lancer en local
Ouvre `index.html` directement dans ton navigateur, ou lance un petit serveur :
```bash
python -m http.server 8000
# puis: http://localhost:8000
```

## Déployer sur GitHub Pages (gratuit)
1. Crée un dépôt GitHub (ex: `conquete-incremental`).
2. Ajoute les fichiers `index.html`, `styles.css`, `game.js` à la racine et pousse :
```bash
git init
git add .
git commit -m "First commit"
git branch -M main
git remote add origin https://github.com/<ton-user>/conquete-incremental.git
git push -u origin main
```
3. Dans **Settings → Pages** :  
   - *Build and deployment* : **Deploy from a branch**  
   - *Branch* : **main** / **root** (/) → **Save**  
4. Ton jeu sera en ligne à l’URL : `https://<ton-user>.github.io/conquete-incremental/`

> Astuces :
> - Garde les chemins **relatifs** (comme ici) pour que tout marche sur Pages.
> - Tu peux ajouter un domaine custom via `Settings → Pages → Custom domain` (ça crée un `CNAME`).

Bon jeu !
