# Studeria — Dashboard de suivi des apprenants

Site statique + une fonction serveur Vercel, connecté en direct à Airtable.

## Fichiers
- `index.html` — dashboard : vue d'ensemble, alertes, recherche filtrée. Cliquer une ligne ouvre la fiche apprenant.
- `detail.html?id=recXXXXXXXXXXXXXX` — fiche apprenant (identité, onboarding, documents, financement).
- `api/learners.js` — fonction serveur Vercel qui va chercher les enregistrements dans Airtable (le token n'est jamais exposé au navigateur).

## Configuration requise sur Vercel

Dans le projet Vercel → **Settings → Environment Variables**, ajoute :

| Nom | Valeur |
|---|---|
| `AIRTABLE_TOKEN` | Un Personal Access Token Airtable, scope `data.records:read`, limité à la base "Studeria essai" |

Comment créer ce token :
1. https://airtable.com/create/tokens
2. "Create new token"
3. Scopes : `data.records:read`
4. Access : sélectionne uniquement la base "Studeria essai"
5. Copie le token généré (visible une seule fois) et colle-le dans Vercel

Après avoir ajouté la variable, redéploie le projet (Vercel → Deployments → "Redeploy" sur le dernier déploiement), sinon la fonction ne verra pas la nouvelle variable.

## Déployer sur Vercel

1. Poussez ce dossier sur GitHub
2. Sur vercel.com → "Add New Project" → importez le repo → ajoutez `AIRTABLE_TOKEN` → Deploy

## Commandes Git

```
cd studeria-dashboard
git add .
git commit -m "Connexion Airtable via fonction serveur"
git push
```
