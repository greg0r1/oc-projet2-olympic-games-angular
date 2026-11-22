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

Ce projet ne comporte pas de tests automatisés. Les fichiers de spec générés par Angular CLI n'étaient pas maintenus et la configuration de test héritée du starter (`src/test.ts`, `karma.conf.js`) ne s'exécute plus avec cette version d'Angular ; les specs ont été retirés. Le script `npm test` du starter n'est donc pas opérationnel.

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
- **Titres** : le titre de la page (nom du pays, « Medals per Country ») est un `h2` dans `HeaderComponent`. Un `h1` « Olympic games app », absent de la maquette, est ajouté dans `AppComponent` pour que chaque page ait un `h1`. C'est un écart assumé avec la maquette.
- **Contexte de l'application** : il est présenté par le `h1` « Olympic games app » et, sur le dashboard, par un court paragraphe d'introduction (ce que montre le graphique, comment ouvrir le détail d'un pays).
- **Totaux de médailles** : le jeu de données fourni ne détaille pas or, argent et bronze. `medalsCount` est traité comme le total des médailles d'une participation, et le total d'un pays est la somme de ces valeurs. La règle « Totals = gold + silver + bronze » du cahier des charges est donc respectée au niveau du total fourni, pas recalculée.
- **Libellé d'axe** : « Dates », sous la courbe, est un simple paragraphe et non un titre.

### Responsive

Mise en page en grille CSS, via le mixin `page-grid` (`src/styles/_layout.scss`) :

| Largeur       | Colonnes |
|---------------|----------|
| ≥ 1200 px     | 12       |
| 768 – 1199 px | 8        |
| ≤ 767 px      | 4        |

Sur desktop, le graphique occupe les colonnes 3 à 10.

J'ai utilisé une grille CSS plutôt que flexbox ou des largeurs fixes, parce que le cahier des charges décrit la mise en page en nombre de colonnes (12, 8 ou 4 selon la largeur). La grille me permet de déclarer ces colonnes une seule fois, dans le mixin `page-grid`, et de placer chaque bloc par rapport à elles : sur desktop, le graphique occupe les colonnes 3 à 10. Avec flexbox, j'aurais dû calculer des pourcentages et gérer les retours à la ligne moi-même. Sur desktop, les indicateurs de l'en-tête sont alignés côte à côte ; sur tablette et mobile, ils s'empilent.

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
- Graphiques : constantes TypeScript (`src/app/constants/chart-colors.ts`), car Chart.js a besoin de valeurs JavaScript. La courbe utilise la couleur principale pour le trait (`borderColor`) et pour les points (`backgroundColor`) : sans `borderColor`, le trait gardait une couleur par défaut peu visible sur fond blanc.

## Accessibilité

Mesure Lighthouse (catégorie Accessibilité, en local, le 22/11/2026) : **100** sur le dashboard et sur la page détail.

| Point                              | Ce qui est en place                                                                                                                                                                                                                                  |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Contraste du texte                 | texte courant `#595959` sur blanc (7,00:1) ; texte secondaire `#6b6b6b` (5,33:1) ; erreur `#b3261e` (6,54:1)                                                                                                                                         |
| Titre de page                      | blanc sur `#0b868f` : 4,36:1. Le titre est en « grand texte » (1.25rem, gras), donc le seuil AA est de 3:1. **Réduire sa taille ou sa graisse ferait échouer ce critère.**                                                                           |
| Contraste de la courbe             | trait et points en `#0b868f` sur blanc : 4,36:1, au-dessus du seuil de 3:1 pour un élément graphique                                                                                                                                                 |
| Graphiques                         | chaque `canvas` a `role="img"` et un `aria-label` qui énumère les valeurs (« Total medals per country: … », « Medals per year: … »)                                                                                                                  |
| `aria-label` sur boutons et icônes | sans objet : l'application n'a ni bouton ni icône sans texte. Le spinner est masqué aux lecteurs d'écran (`aria-hidden`) et le lien « Go back » a un libellé visible, qu'un `aria-label` remplacerait inutilement                                    |
| Structure                          | `header` (repère `banner`) avec le `h1`, `main` autour du contenu, un `h2` par page                                                                                                                                                                  |
| États                              | `loading` annoncé avec `role="status"`, `error` avec `role="alert"`                                                                                                                                                                                  |
| Focus                              | aucun style ne supprime l'anneau de focus du navigateur ; le seul élément interactif des pages hors graphique est le lien « Go back ». Test au clavier : la touche Tab arrive directement sur ce lien, sur la page détail et sur la page introuvable |

## Limites connues

- **Couleur principale dupliquée** : `#0b868f` existe dans `_colors.scss` et dans `chart-colors.ts` (SCSS et Chart.js ne peuvent pas partager un fichier). Les deux valeurs doivent être modifiées ensemble.
- **Constantes de routes non factorisées** : `'/not-found'`, `'/country'`, le paramètre `id` et les chemins du routing apparaissent en littéraux.
- **Cause d'erreur masquée** : le `catchError` du service remplace toute erreur de chargement ou de validation par un message générique ; la cause réelle n'est pas journalisée.
- **Messages en anglais**, non internationalisés.
- **Pas de bouton « réessayer »** sur le dashboard en cas d'erreur.
- **Camembert non utilisable au clavier** : la sélection d'un pays se fait uniquement à la souris ou au toucher. Les valeurs sont lisibles par un lecteur d'écran, mais pas de navigation vers un pays.
- **Contraste des tranches claires du camembert** : `#adc3de` (1,80:1 sur blanc), `#ffa500` (1,97:1) et `#94819d` (3,57:1) sont sous le seuil de 3:1 pour des éléments graphiques. Les valeurs restent accessibles par le libellé et l'infobulle.
- **Gardes de type écrites à la main** : le type TypeScript et sa garde peuvent diverger si l'un est modifié sans l'autre.
- **Aucun test automatisé** : voir la section Installation. Les gardes de validation, les états des pages et les calculs du service ne sont pas couverts.
