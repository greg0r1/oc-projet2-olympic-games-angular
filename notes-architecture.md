# Notes d'architecture – Télésport

## 1. Analyse du starter code

### 1.1 Constats sur la structure

- **Taille des fichiers** : aucun fichier trop volumineux. Le plus gros est `home.component.ts` (70 lignes), puis `country.component.ts` (67 lignes), très en dessous du seuil indicatif de 300 lignes.
- **Dossiers présents** : `pages/` (`home`, `country`, `not-found`). Les pages sont déjà séparées.
- **Dossiers manquants** : `components/` (composants réutilisables), `services/` (accès aux données), `models/` (interfaces TypeScript).
- **Routing** : déjà en place (`app-routing.module.ts`).
- **Technologies** : Angular 18 avec NgModules (`app.module.ts`), Chart.js 4.5, données dans `assets/mock/olympic.json` (5 pays).
- **Outils** : pas de configuration `ng lint` (ESLint absent de `package.json`).

### 1.2 Problèmes identifiés

| # | Problème | Où | Commentaire |
|---|---|---|---|
| P1 | `any` partout (17 occurrences), pas d'interfaces | `home.component.ts` l.26-30 ; `country.component.ts` l.16, 30-38 | Remplacer les `any` par de vrais types : créer les interfaces `Olympic` et `Participation` (dossier `models/`) et typer l'appel HTTP. Avec les bons types, la plupart des `: any` disparaissent d'eux-mêmes. |
| P2 | Calculs métier dans les composants | `home.component.ts`, `country.component.ts` | Un composant sert à afficher. Les calculs (totaux de médailles et d'athlètes, nombre d'années) sortent vers un service, pour que le composant reçoive des données prêtes à afficher. |
| P3 | `HttpClient` dans les composants, requête dupliquée | `home.component.ts`, `country.component.ts` | Un composant ne fait pas lui-même l'appel à l'API. Ici le même code est écrit deux fois. Un seul service fera la requête et les composants l'appelleront. Pratique aussi pour la future vraie API. |
| P4 | `subscribe` mal implémenté (signature dépréciée, `.pipe()` vide, cas vide et pays introuvable non gérés) | `home.component.ts`, `country.component.ts` | Utiliser la syntaxe non dépréciée (objet `{ next, error }`) ou, mieux, le pipe `async` dans le template, qui gère la désinscription. Supprimer le `.pipe()` vide. Gérer le pays introuvable et le cas sans données. |
| P5 | `console.log` à supprimer | `home.component.ts` l.24 et l.35 | Supprimer ces logs. Le premier écrit toutes les données dans la console. Si un log est utile, ne le garder qu'en développement (`isDevMode()`). |
| P6 | Code inutile (`map(i => i)`, `toString()` puis `parseInt()`) | `country.component.ts` l.32, 35-38 | Supprimer le `map(i => i)` qui ne change rien. Retirer `toString()` puis `parseInt()` : la valeur est déjà un nombre. |
| P7 | Erreur capturée mais jamais affichée à l'utilisateur | `home.component.ts`, `country.component.ts`, templates HTML | Le champ `error` est rempli mais aucun template ne l'affiche : l'utilisateur voit des zéros ou un graphique vide, sans explication. Afficher un message simple (par exemple « Impossible de charger les données ») et garder le détail technique pour le développeur. |
| P8 | Pays inexistant non géré : pas de redirection vers `NotFoundComponent` | `country.component.ts`, `app-routing.module.ts` | Une URL comme `/country/xyz` correspond à la route pays, donc la route `**` ne s'applique pas : le composant plante au lieu de rediriger vers la page not-found. Rediriger si le pays est introuvable. |
| P9 | Pays recherché par nom (`country/:countryName`) au lieu de l'ID | `app-routing.module.ts`, `country.component.ts`, `home.component.ts` (navigation avec le nom du pays) | Les spécifications demandent `/country/:id`. Passer à l'ID dans la route et dans la recherche. |
| P10 | Valeurs en dur (magic strings et nombres) : URL du fichier JSON, nom du paramètre `countryName`, noms de route, id des canvas (`"countryChart"`, `"DashboardPieChart"`), libellés, tableau de 6 couleurs, ratio `2.5` | `home.component.ts`, `country.component.ts` | Les mettre dans des constantes nommées. L'URL ira dans `DataService`. Le nom du paramètre est écrit dans le routing et dans le composant : une seule constante évite les oublis. |
| P11 | Graphique jamais détruit (pas de `ngOnDestroy`) | `home.component.ts`, `country.component.ts` | L'instance Chart.js reste en mémoire quand on quitte la page. Il faut la détruire : implémenter `OnDestroy` et appeler `destroy()` sur le graphique dans `ngOnDestroy`. Gravité faible, mais c'est une bonne pratique Chart.js. |
| P12 | `Router` injecté mais jamais utilisé | `country.component.ts` | Code mort à supprimer, ou à utiliser pour rediriger quand le pays est introuvable. |
| P13 | Navigation écrite dans la configuration du graphique (`onClick`), avec un repli sur une chaîne vide si l'étiquette est absente | `home.component.ts` | Le graphique ne doit pas piloter la navigation. Le clic renvoie le pays choisi (son ID) et la page navigue. Prévoir le cas où aucun pays n'est trouvé. |
| P14 | Bloc titre + indicateurs (libellé et valeur) copié dans les deux templates | `home.component.html`, `country.component.html` | Même structure écrite deux fois. À extraire dans un composant réutilisable (`HeaderComponent`). |
| P15 | `{{ pieChart }}` et `{{ lineChart }}` affichés dans la balise `<canvas>` | `home.component.html`, `country.component.html` | On interpole un objet Chart.js dans le canvas : cela n'a aucun sens et peut afficher `[object Object]`. À supprimer. |
| P16 | CSS global générique : classes `.center` et `.split` avec des sélecteurs `div` imbriqués, `.center` redéfini dans `not-found`, `.heading` inutilisé | `styles.scss`, `not-found.component.scss` | Un même nom de classe pour deux usages différents et des règles qui touchent tous les `div` : fragile. Supprimer `.heading` (code mort) et préciser les styles. |

## 2. Nouvelle architecture

### 2.1 Arborescence cible

```
src/app/
  ├── components/
  ├── pages/
  ├── services/
  └── models/
```

### 2.2 Déplacement virtuel (code actuel → nouvelle destination)

| Code / fichier actuel | Destination | Raison |
|---|---|---|
| Appel `http.get` dans `home.component.ts` et `country.component.ts` | `services/data.service.ts` | Un seul endroit appelle l'API : plus de code dupliqué, et c'est ici qu'on changera la source des données (fichier JSON, puis vraie API). |
| Types `any` des données | `models/` (`Olympic`, `Participation`) | Des données bien typées : les erreurs se voient à l'écriture du code et plus à l'exécution. |
| Calculs des totaux (médailles, athlètes, années) | `services/data.service.ts` | Les composants reçoivent des données prêtes à afficher et ne font plus de calculs. |
| Titre de page + indicateurs (libellé et valeur), affichés sur `home` et `country` | `components/` (`HeaderComponent`) | Même structure sur les deux pages : un composant écrit une fois et réutilisé. |
| Construction des graphiques (`buildPieChart` dans `home`, `buildChart` dans `country`) | `components/` (composants de graphique) | Les pages ne dessinent plus les graphiques elles-mêmes, les composants peuvent être réutilisés, et la destruction du graphique (`destroy()`) est écrite une seule fois. |
| `home`, `country`, `not-found` | `pages/` (inchangés) | Les pages sont déjà séparées et bien placées. |

### 2.3 Patterns choisis

- **Singleton (service avec `providedIn: 'root'`)** : une seule instance de `DataService` partagée dans toute l'application. Un seul point d'appel aux données, plus de code dupliqué (P3).
- **Séparation des responsabilités (composant / service)** : le composant affiche, le service récupère et prépare les données. Les calculs et l'appel HTTP sortent des composants (P2, P3).
- **Pages (conteneurs) / composants (affichage)** : les pages récupèrent les données via le service, les composants réutilisables (par exemple `HeaderComponent`) se contentent d'afficher ce qu'on leur donne.
- **Observer (observables RxJS)** : le service renvoie des observables, le template s'y abonne avec le pipe `async`. Pas de `subscribe` manuel et désinscription automatique (P4).
- **Un seul `DataService`** : pour ce projet, il fait l'appel HTTP et les calculs, comme demandé dans les spécifications. Pas de service API séparé pour ne pas compliquer la structure.

### 2.4 Impact pour le futur back-end

- `DataService` est le seul à connaître l'URL et `HttpClient` : passer du fichier JSON à une vraie API REST ne modifie que ce service.
- Les composants ne changent pas, car ils dépendent des interfaces (`Olympic`, `Participation`) et pas de la source des données.
- La gestion des erreurs réseau est faite à un seul endroit, puis le composant affiche un message simple.
- Si l'API devient plus grosse, l'appel HTTP pourra être extrait dans un service dédié sans toucher aux composants.
