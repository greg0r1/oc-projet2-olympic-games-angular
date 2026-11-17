# ARCHITECTURE

## 1. Vue d'ensemble

- Application Angular 18 (NgModules) : 2 pages (Home, Country), données dans un fichier JSON (`assets/mock/olympic.json`, 5 pays).
- Point de départ : l'arborescence proposée par l'exercice.

## 2. Arborescence

```
src/app/
├── components/    composants réutilisables d'affichage
│   ├── header/
│   ├── pie-chart/
│   └── line-chart/
├── pages/         composants liés à une route
│   ├── home/
│   ├── country/
│   └── not-found/
├── services/      accès aux données et calculs
│   └── data.service.ts
└── models/        interfaces TypeScript
```

Schéma de l'architecture (réalisé avec draw.io) :

![Schéma de l'architecture front-end](architecture.drawio.png)

## 3. Rôle de chaque élément

| Élément                                     | Rôle                                                                                     | Reçoit                                  | Renvoie / émet                                                 |
|---------------------------------------------|------------------------------------------------------------------------------------------|-----------------------------------------|----------------------------------------------------------------|
| `DataService`                               | Charge le fichier JSON, calcule les totaux et prépare les données de chaque page         | Le nom du pays (pour `getCountryView`)  | Des observables de vue-modèle : `HomeView`, `CountryView`      |
| Pages (`HomeComponent`, `CountryComponent`) | Récupèrent les données du service, les transmettent aux composants, gèrent la navigation | Les vues-modèles du service             | Rien. Home reçoit l'index du camembert et navigue vers le pays |
| `HeaderComponent`                           | Affiche le titre de la page et ses indicateurs (libellé + valeur)                        | `pageTitle`, `Indicator[]`              | Rien                                                           |
| `PieChartComponent`                         | Affiche le camembert de la page Home                                                     | `ChartItem[]`                           | L'index du secteur cliqué (`number`)                           |
| `LineChartComponent`                        | Affiche la courbe des médailles par année du pays                                        | `labels` (années), `values` (médailles) | Rien                                                           |
| `models/`                                   | Définit les interfaces TypeScript des données et des vues                                | Sans objet                              | Sans objet                                                     |

## 4. Flux de données

- Schéma simple : JSON → `DataService` → page → composants d'affichage
- Ce qui descend (`@Input`) :
    - `HomeComponent` donne `indicators` et `titlePage` à `HeaderComponent`.
    - `HomeComponent` donne `chartItems` à `PieChartComponent`.
    - `CountryComponent` donne `years` et `medals` à `LineChartComponent`.
- Ce qui remonte (`@Output`) :
    - `PieChartComponent` émet l'index du secteur cliqué (`itemSelected`), `HomeComponent` reçoit l'index, retrouve le pays dans sa liste et navigue.

## 5. Choix de conception

- Vue-modèle par page : la page reçoit des données prêtes à afficher, sans calcul.
- `ChartItem` générique : le graphique ne connaît pas le métier, il affiche libellé + valeur.
- Index émis par le camembert : le graphique ignore nom et id du pays ; la page retrouve le pays dans sa liste (même ordre que `chartItems`).
- `shareReplay(1)` dans le constructeur : un seul flux, une seule requête HTTP partagée entre les pages.
- Alias de chemin : imports lisibles, sans `../../../..`.

## 6. Alternatives écartées

- **Dossiers par fonctionnalité** (`features/home`, `features/country`) : écartés. Il y a seulement deux pages, et elles partagent les mêmes composants (en-tête, graphiques) et le même service. Regrouper par fonctionnalité n'apporterait rien de plus que quatre dossiers par type.
- **Architecture hexagonale** : écartée. Il n'y a qu'une seule source de données et aucune règle métier complexe. Le seul changement prévu (fichier JSON vers API) ne touche que `DataService` et les modèles de données.
- **Clean architecture** : écartée. Séparer l'application en plusieurs couches (domaine, cas d'usage, infrastructure) ajouterait des fichiers et des interfaces pour de simples sommes et comptages.

## 7. Limites et suite

- `DataService` fait HTTP + calculs : à scinder si l'application grossit.
- Évolution prévue : seuls `DataService` et les modèles de données changent ; les pages et composants ne sont pas touchés.
- Reporté à l'exercice 2 :
    - route par id, redirection vers NotFound pour un pays inexistant, affichage des erreurs
    - constantes restantes (couleurs, ratio, libellés, nom du paramètre)
    - le CSS global
    - la désinscription des observables, que la consigne demande
    - le test responsive et le README
    - les états loading et empty (« Aucune donnée »), en plus de l'état error
    - l'accessibilité de base (contrastes, focus visibles, `aria-label`, description textuelle des graphiques)
