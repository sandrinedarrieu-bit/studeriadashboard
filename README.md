# Studeria — Dashboard de suivi des apprenants

Site statique (HTML/CSS/JS, aucune dépendance serveur) avec 1000 apprenants simulés.

## Pages
- `index.html` — dashboard : vue d'ensemble, alertes, recherche filtrée. Cliquer une ligne ouvre la fiche apprenant.
- `detail.html?id=N` — fiche apprenant : identité, onboarding, documents (téléchargeables), financement, encaissement.
- `data.js` — génération des données simulées, partagée par les deux pages (même seed = mêmes apprenants).

## Déployer sur Vercel

1. Poussez ce dossier sur GitHub (voir commandes ci-dessous)
2. Sur vercel.com → "Add New Project" → importez le repo → Deploy (aucune config nécessaire)

## Commandes Git

```
cd studeria-dashboard
git init
git add .
git commit -m "Dashboard de suivi des apprenants"
git branch -M main
git remote add origin https://github.com/<votre-compte>/studeria-dashboard.git
git push -u origin main
```
