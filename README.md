# Télésport — Olympic Games (Angular 18)

Application web qui présente les médailles des Jeux olympiques par pays : un tableau de bord (camembert) et une page de détail par pays (courbe des médailles par édition).

- Angular 18 (NgModules), généré avec Angular CLI 18.0.6
- Chart.js 4 pour les graphiques, RxJS 7.8
- Données : `src/assets/mock/olympic.json` (5 pays)

## Installation et lancement

Prérequis : Node.js compatible avec Angular 18 (18.19.1 ou plus, ou 20.11.1 ou plus) et npm.

```bash
npm install
npm start          # serveur de développement : http://localhost:4200/
npm run build      # build de production dans dist/
```

> **À compléter :** l'état de `npm test` (les `*.spec.ts` du starter ne sont pas à jour). Indiquer ici ce que tu décides : corriger ou supprimer.

## Routes

| URL                             | Page                                                |
|---------------------------------|-----------------------------------------------------|
| `/`                             | Dashboard : camembert des médailles par pays        |
| `/country/:id`                  | Détail d'un pays (courbe des médailles par édition) |
| `/not-found` et toute autre URL | Page « introuvable »                                |

Un identifiant invalide ou inconnu redirige vers `/not-found` (avec `replaceUrl`, pour que le bouton « précédent » ne ramène pas sur l'URL invalide).

## Structure du projet

```
src/
├── app/
│   ├── components/      composants d'affichage réutilisables
│   │   ├── header/          titre de page + indicateurs
│   │   ├── pie-chart/       camembert (émet l'index du secteur cliqué)
│   │   ├── line-chart/      courbe des médailles par année
│   │   └── status-message/  états loading / empty / error
│   ├── pages/           composants liés à une route
│   │   ├── dashboard-page/
│   │   ├── country-detail-page/
│   │   └── not-found/
│   ├── services/
│   │   ├── data.service.ts        chargement du JSON, calcul des vues
│   │   └── olympic-validator.ts   validation des données reçues
│   ├── models/          interfaces TypeScript (données et vues)
│   └── constants/       constantes (couleurs des graphiques)
├── styles/              partiels SCSS : _breakpoints, _layout, _colors
└── assets/mock/         olympic.json
docs/                    ARCHITECTURE.md, schéma, notes
```

Alias de chemin : `@models`, `@services`, `@components`, `@pages`, `@constants`.

Le détail de l'architecture (rôle de chaque élément, flux de données, alternatives écartées) est dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Décisions de conception

- **Une vue-modèle par page** (`DashboardView`, `CountryView`) : la page reçoit des données prêtes à afficher, sans calcul.
- **Graphiques génériques** : `ChartItem` (libellé + valeur). Le camembert émet l'index du secteur cliqué, la page retrouve le pays dans sa liste.
- **Une seule requête HTTP** : `shareReplay(1)` dans `DataService`.
- **Pages nommées selon les spécifications** : `DashboardPageComponent`, `CountryDetailPageComponent` (suffixe `Component` selon le style guide Angular).
- **Route `/country/:id`** : l'identifiant est stable et unique, contrairement au nom (espaces, accents).

### Responsive

Mise en page en grille CSS, via le mixin `page-grid` (`src/styles/_layout.scss`) :

| Largeur       | Colonnes |
|---------------|----------|
| ≥ 1200 px     | 12       |
| 768 – 1199 px | 8        |
| ≤ 767 px      | 4        |

Sur desktop, le graphique occupe les colonnes 3 à 10.

> **À compléter (avec tes mots) :** pourquoi une grille plutôt qu'une autre approche (flex, colonnes fixes…), et ce que « côte à côte » signifie dans ton choix. Tu devras pouvoir le défendre à l'oral.

### États d'affichage : loading, empty, error

- Chaque page possède un champ `status` de type `ViewStatus` (`'loading' | 'success' | 'empty' | 'error'`). L'état d'interface appartient à la page, le service reste sans état d'affichage.
- Un seul composant, `StatusMessageComponent`, affiche les trois états non nominaux (`loading` : spinner, `empty` : « No data available. », `error` : message). Son entrée est typée `Exclude<ViewStatus, 'success'>` : il est impossible de lui demander d'afficher le succès.
- Dashboard : en erreur, pas de bouton. Page détail : le lien « Go back » reste visible dans tous les états.
- Cas « vide » : une liste de pays vide (dashboard) ou un pays sans participation (détail).

### Validation des données (stricte, à la frontière)

`DataService` reçoit le JSON typé `unknown` et le valide avant toute utilisation (`olympic-validator.ts`, gardes de type écrites à la main, sans `any`). Sont rejetés :

- une racine qui n'est pas un tableau ;
- un `id` (pays ou participation) ou un `year` qui n'est pas un entier ;
- un `country` ou une `city` vide ;
- un `medalsCount` ou `athleteCount` qui n'est pas un entier positif ou nul ;
- `participations` absent ou qui n'est pas un tableau ;
- deux pays avec le même `id`.

Toute donnée invalide fait échouer le chargement (stratégie **stricte**) : l'utilisateur voit le message `Unable to load the data. Please try again later.` et non un message technique. Un tableau vide est en revanche valide : il produit l'état `empty`.

Pourquoi à la frontière : les pages et composants peuvent faire confiance aux types, et la validation n'existe qu'à un seul endroit.

Dans le dashboard, un clic sur un secteur dont le pays est introuvable redirige vers `/not-found`.

### Couleurs

- Styles : variables SCSS nommées par rôle (`$color-primary`, `$color-text-muted`, `$color-text-subtle`) dans `src/styles/_colors.scss`.
- Graphiques : constantes TypeScript (`src/app/constants/chart-colors.ts`), car Chart.js a besoin de valeurs JavaScript.

## Accessibilité

> **À compléter après l'étape accessibilité.** Ne décris ici que ce qui est réellement fait : contrastes (AA), focus visibles, `aria-label` et description textuelle des graphiques, titre `h1`. Aujourd'hui, seuls les états `loading` (`role="status"`) et `error` (`role="alert"`) sont annoncés aux lecteurs d'écran.

## Limites connues

- **Couleur principale dupliquée** : `#0b868f` existe dans `_colors.scss` et dans `chart-colors.ts` (SCSS et Chart.js ne peuvent pas partager un fichier). Les deux valeurs doivent être modifiées ensemble.
- **Constantes de routes non factorisées** : `'/not-found'`, `'/country'`, le paramètre `id` et les chemins du routing apparaissent en littéraux.
- **Cause d'erreur masquée** : le `catchError` du service remplace toute erreur de chargement ou de validation par un message générique ; la cause réelle n'est pas journalisée.
- **Messages en anglais**, non internationalisés.
- **Pas de bouton « réessayer »** sur le dashboard en cas d'erreur.
- **Camembert non utilisable au clavier** : la sélection d'un pays se fait uniquement à la souris ou au toucher.
- **Gardes de type écrites à la main** : le type TypeScript et sa garde peuvent diverger si l'un est modifié sans l'autre.
- **Tests unitaires** : voir la section Installation.

## Pistes d'évolution

- Source de données : passer du fichier JSON à une API ne toucherait que `DataService` et les modèles.
- Validation : sur un projet plus grand, remplacer les gardes écrites à la main par un schéma (par exemple Zod) ou par des types générés depuis un contrat OpenAPI, pour avoir une seule source de vérité.
- Ajouter un bouton « réessayer » et une version accessible au clavier du camembert (liste des pays).

## Captures d'écran

> **À compléter :** captures du dashboard et de la page détail, en desktop et en mobile, rangées dans un dossier du dépôt ou jointes au livrable, avec les liens ici.
