# Chaîne agricole — **Guide des menus**

> Complément de `ARCHITECTURE.md`, à donner au développeur front (ou à Claude) avant d'écrire un menu.
> `ARCHITECTURE.md` fixe le mécanisme : un fichier `<m>.menu.ts` par application, porté par la route du module, filtré par les permissions.
> Ce guide donne le reste : **ce qu'un menu doit contenir, à quoi il ressemble, comment il se comporte, et le contenu complet des 8 menus**, prêt à copier.
>
> En chiffres : 8 applications, 29 sections, 98 entrées, 23 compteurs, 98 icônes.
> Le code de ce guide est compilé avec Angular 19.2 en mode strict, et la logique du menu a été exécutée pour chaque rôle (§10).

---

## Table des matières

0. [Mode d'emploi](#0-mode-demploi)
1. [Le menu en un coup d'œil](#1-le-menu-en-un-coup-dœil)
2. [Le contrat de données](#2-le-contrat-de-données)
3. [Règles d'écriture d'un menu](#3-règles-décriture-dun-menu)
4. [Rendu du menu latéral](#4-rendu-du-menu-latéral)
5. [Menu réduit, tiroir et barre du bas](#5-menu-réduit-tiroir-et-barre-du-bas)
6. [Comportements](#6-comportements)
7. [Logique commune](#7-logique-commune)
8. [Compteurs](#8-compteurs)
9. [Les 8 menus](#9-les-8-menus)
10. [Ce que voit chaque rôle](#10-ce-que-voit-chaque-rôle)
11. [Icônes](#11-icônes)
12. [Recette](#12-recette)
13. [Points à confirmer](#13-points-à-confirmer)

---

## 0. Mode d'emploi

1. **Lire `ARCHITECTURE.md` d'abord** : règles d'or (§6), charte graphique (§8), menus et routes (§10 et §11). Ce guide n'en répète pas les variables de couleur ni les guards.
2. **Copier tels quels** les fichiers de données : `icons.ts`, `core/models/menu.model.ts`, `core/services/menu.service.ts`, les 8 fichiers `<m>.menu.ts` du §9 et `auth/data/utilisateurs-demo.mock.ts`. Ils sont aussi fournis dans `menus-chaine-agricole.zip`.
3. **Construire les composants de rendu** d'après les §4 à §6 : le menu latéral (référence au §7.2), le panneau du menu réduit, le tiroir, la barre du bas, le fil d'Ariane.
4. **Ne jamais écrire un libellé, une icône ou une adresse de menu dans un template.** Tout vient des fichiers `<m>.menu.ts`.
5. **Vérifier avec la recette du §12**, en se connectant avec chacun des sept utilisateurs de démonstration.
6. Pour modifier un menu : changer son fichier `<m>.menu.ts`, puis la route et la permission qui vont avec (`ARCHITECTURE.md`, §20).

---

## 1. Le menu en un coup d'œil

### 1.1 Trois niveaux, pas un de plus

| Niveau | Où | Ce qu'on y choisit |
|--------|----|--------------------|
| **Application** | le portail, et « Applications » dans la barre supérieure | l'une des 8 applications permises au rôle |
| **Section** | le menu de l'application | un domaine de travail : Avances, Trésorerie, Dépenses… |
| **Entrée** | sous la section | un écran : une liste, un tableau de bord, une saisie |

Ce qui demanderait un quatrième niveau devient un onglet de fiche. La barre supérieure porte ce qui ne dépend pas de l'application : la campagne, les alertes, le compte.

### 1.2 Sur ordinateur

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [≡]  Chaîne agricole › Comptabilité   [ Cajou 2026 ▾ ]   Alertes (4)   Applications   CD │   1
├───────────────────────────────┬──────────────────────────────────────────────────────────┤
│ [ Rechercher dans le menu ]   │ Comptabilité › Avances aux producteurs › Décaissement    │   2 · 8
│                               │                                                          │
│ AVANCES AUX PRODUCTEURS     ▾ │ Décaissement                               [ Verser ]    │   3
│   Demandes d'avance           │                                                          │
│   Validation              (3) │                                                          │   5
│ ▌ Décaissement            (2) │                                                          │   4
│   Suivi des remboursements    │                                                          │
│   Avances sans livraison  (4) │                                                          │
│ TRÉSORERIE           (12)   ▸ │                                                          │   6
│ DÉPENSES              (5)   ▸ │                                                          │
│ COÛTS ET RÉSULTAT           ▸ │                                                          │
│                               │                                                          │
│ « Réduire le menu             │                                                          │   7
└───────────────────────────────┴──────────────────────────────────────────────────────────┘
         264 px
```

1. **Barre supérieure** : bouton du menu, nom de l'application ouverte, campagne, alertes, « Applications », compte.
2. **Recherche** : seulement quand le menu dépasse douze entrées visibles.
3. **Section ouverte** : celle de la page courante, toujours. Les autres se déplient au clic.
4. **Entrée active** : fond vert pâle, filet vert à gauche, texte plus gras. Elle reste active sur les fiches de sa liste.
5. **Compteur** : ce qui attend l'utilisateur dans cet écran. Rien s'il n'y a rien.
6. **Section repliée** : elle affiche le total de ses compteurs, pour que rien de ce qui attend ne soit caché.
7. **Pied du menu** : réduire le menu à une colonne d'icônes.
8. **Fil d'Ariane** : application, section, entrée. Il vient du même fichier que le menu.

### 1.3 Menu réduit

```
┌──────┬───────────────────────────────────────────┐
│  ▌◆  │                                           │   Avances aux producteurs : section de la page courante
│   ◆• │┌───────────────────────────────────┐      │   Trésorerie : le point dit que des éléments attendent
│   ◆  ││ TRÉSORERIE                        │      │   Dépenses
│   ◆  ││   Caisses et comptes              │      │   Coûts et résultat
│      ││   Journal de caisse et banque     │      │
│      ││   Paiements aux producteurs (12)  │      │
│      ││   Encaissements clients           │      │
│      ││   Transferts de fonds             │      │
│      │└───────────────────────────────────┘      │
│   »  │                                           │   Ouvrir le menu
└──────┴───────────────────────────────────────────┘
 72 px      panneau de 248 px
```

Une icône par section. Un clic ouvre le panneau de la section ; une section d'une seule entrée y mène directement.

### 1.4 Sur téléphone

```
┌─────────────────────────────────────────────────────────────────────┐
│ [≡]  Producteurs et collecte                                  SD    │   barre supérieure
│      Cajou 2026 ▾                                                   │   campagne
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Pesées                                [ Nouvelle pesée ]           │   page courante
│                                                                     │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│      ◆      │      ◆      │      ◆•     │      ◆      │      ≡      │   barre du bas : 4 entrées épinglées
│ Producteurs │    Peser    │    Pesées   │    Envois   │     Menu    │   et « Menu », qui ouvre le tiroir
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
                            360 px
```

Le menu complet est dans le tiroir. La barre du bas porte les quatre écrans les plus utilisés du rôle et le bouton « Menu ».

### 1.5 Les 8 menus en chiffres

| Application | Fichier | Sections | Entrées | Compteurs | Recherche | Barre du bas, tous droits |
|-------------|---------|----------|---------|-----------|-----------|---------------------------|
| **Pilotage** | `pilotage/pilotage.menu.ts` | 3 | 6 | 2 | non | Tableau · Zones · Alertes · Approbations · Menu |
| **Producteurs et collecte** | `terrain/terrain.menu.ts` | 3 | 9 | 2 | non | Producteurs · Peser · Pesées · Envois · Menu |
| **Dépôts et traitement** | `depots/depots.menu.ts` | 3 | 8 | 3 | non | Entrées · Lots · Traitement · Sorties · Menu |
| **Ventes et import-export** | `ventes/ventes.menu.ts` | 4 | 12 | 3 | non | Clients · Lots · Contrats · Factures · Menu |
| **Comptabilité** | `comptabilite/comptabilite.menu.ts` | 7, dont 3 fermées | 33, dont 19 ouvertes | 9 | oui | Validation · Décaissement · Journal · Paiements · Menu |
| **Ressources humaines** | `rh/rh.menu.ts` | 4 | 12 | 4 | non | Employés · Présences · Congés · Paie du mois · Menu |
| **Administration** | `administration/administration.menu.ts` | 4 | 13 | 0 | oui | Utilisateurs · Produits · Campagnes · Paramètres · Menu |
| **Mon espace** | `mon-espace/mon-espace.menu.ts` | 1 | 5 | 0 | non | Compte · Livraisons · Paiements · Avances · Champs |

---

## 2. Le contrat de données

Un menu est une donnée, décrite par trois interfaces. Elles vivent dans `core/models/menu.model.ts`.

```ts
import { ModuleId, ModuleStatus, Permission } from '../../config';
import { IconName } from '../../icons';

export interface MenuItem {
  id: string;                    // unique dans le module ; sert aussi de clé de compteur
  label: string;                 // 28 caractères au plus : tient sur une ligne du menu
  short?: string;                // libellé de la barre du bas, 12 caractères au plus ; par défaut : label
  icon: IconName;                // clé du registre icons.ts : une faute de frappe ne compile pas
  route: string;                 // chemin absolu, ex. '/comptabilite/avances/demandes'
  permission?: Permission;       // absent = visible par tous ceux qui ouvrent le module
  hint?: string;                 // une ligne : ce qu'on y fait (infobulle, recherche dans le menu)
  badge?: boolean;               // true = l'item peut afficher un compteur
  pin?: boolean;                 // true = candidat à la barre du bas sur téléphone
}

export interface MenuSection {
  id: string;                    // unique dans le module, ex. 'avances'
  title?: string;                // absent = items affichés sans groupe repliable
  icon?: IconName;               // obligatoire avec un titre : c'est elle qu'on voit quand le menu est réduit
  status?: ModuleStatus;         // 'soon' = section pas encore livrée : masquée, routes fermées
  items: MenuItem[];
}

export interface ModuleMenuConfig {
  module: ModuleId;
  sections: MenuSection[];
}
```

| Propriété | Obligatoire | Sert à | Règle |
|-----------|-------------|--------|-------|
| `MenuItem.id` | oui | clé de l'entrée, clé de son compteur | unique dans l'application ; dans un module à sections : `<section>-<page>` |
| `label` | oui | texte du menu, du fil d'Ariane, du titre de page | 28 caractères au plus (§3.1) |
| `short` | quand l'entrée peut aller dans la barre du bas et que `label` dépasse 12 caractères | texte de la barre du bas | 12 caractères au plus ; à défaut, `label` coupé |
| `icon` | oui | icône de l'entrée | clé de `icons.ts` ; unique dans l'application (§3.4) |
| `route` | oui | adresse de l'écran | absolue ; déclarée dans `<m>.routes.ts` |
| `permission` | oui, sauf exception | montrer ou cacher l'entrée | **la même** que la route |
| `hint` | oui | infobulle, recherche dans le menu | une ligne, 68 caractères au plus (§3.5) |
| `badge` | non | autoriser un compteur | seulement si l'entrée figure au §8 |
| `pin` | non | candidate à la barre du bas | six au plus par application ; les quatre premières visibles sont retenues |
| `MenuSection.id` | oui | clé de la section ; segment d'adresse dans un module à sections | unique dans l'application |
| `title` | non | titre du groupe repliable | court, sans verbe ; absent : les entrées s'affichent directement, toujours visibles (début de Pilotage, Mon espace) |
| `icon` (section) | avec `title` | icône du menu réduit | celle de l'entrée la plus représentative |
| `status` | non | fermer une section pas encore livrée | `'soon'` la retire du menu et ferme ses routes |

Trois propriétés facultatives s'ajoutent à la première version d'`ARCHITECTURE.md` (`hint`, `short`, `pin`), ainsi que l'icône de section ; `exact` disparaît, remplacé par `MenuService.locate()`. `ARCHITECTURE.md` a été mis à jour : les deux fichiers disent la même chose.

---

## 3. Règles d'écriture d'un menu

### 3.1 Libellés

- **Le nom de la chose, pas l'action** : « Pesées », pas « Gérer les pesées ». Seule exception : l'entrée de création que le rôle utilise toute la journée (« Nouvelle pesée »).
- **Les mots du client** : pesée, bordereau, lot, avance, décaissement, dépôt. Jamais un nom de table.
- **Pluriel pour une liste** (« Factures »), **singulier pour un écran unique** (« Société », « Traitement »).
- **28 caractères au plus**, sur une ligne. Majuscule au premier mot seulement. Pas de sigle, pas de point final.
- **Le même mot pour la même chose partout** : « Rapports » clôt chaque menu ; « Coût de revient » s'écrit de la même façon en Ventes et en Comptabilité.

### 3.2 Sections

- De deux à sept entrées par section. Au-delà, on coupe en deux.
- Le titre nomme un domaine de travail (« Trésorerie », « Collecte »), en un à trois mots.
- Une application de cinq entrées au plus n'a pas de titres : ses entrées s'affichent directement (Mon espace). Le premier groupe d'un menu peut aussi s'en passer, pour garder ses écrans toujours visibles (le tableau de bord de Pilotage).
- La section « Suivi », avec « Rapports », vient toujours en dernier.

### 3.3 Ordre

- **L'ordre du travail** : ce qui entre, ce qu'on traite, ce qui sort, ce qu'on lit. En Dépôts : Entrées, Lots, Traitement, Valeur, Sorties, puis le stock.
- **La première entrée permise d'un rôle est sa page d'arrivée** (`moduleHome`). Elle doit donc être son écran de travail : le comptable arrive sur les avances, le responsable de dépôt sur les entrées.
- Les réglages et les référentiels viennent après les opérations.

### 3.4 Icônes

- **Une notion, une icône**, dans toutes les applications : la balance pour une pesée, le tampon pour une décision, le billet pour une sortie d'argent (§11.1).
- **Jamais deux fois la même icône dans un menu** : le menu réduit ne montre qu'elles.
- L'icône d'une section est celle de son entrée la plus représentative.
- Les clés sont typées (`IconName`) : une faute de frappe ne compile pas.

### 3.5 Aide

- **Une ligne, 68 caractères au plus**, qui commence par un verbe à l'infinitif et dit ce que l'utilisateur fait dans l'écran : « Recevoir un bordereau : repeser et ranger les sacs dans un lot ».
- Dans Mon espace, elle parle au producteur : « Vos pesées, avec la date, le poids et le montant ».
- Elle sert d'infobulle, nourrit la recherche du menu, et peut servir de sous-titre à l'en-tête de page.

### 3.6 Compteurs

- Un compteur dit **combien d'éléments attendent une action de l'utilisateur connecté**, dans son périmètre et pour la campagne choisie. Jamais un total, jamais une statistique.
- Pas de compteur à zéro. Au-delà de 99 : « 99+ ».
- Une entrée n'a un compteur que si elle figure au §8.

### 3.7 Barre du bas

- `pin: true` désigne les écrans qu'un rôle ouvre plusieurs fois par jour sur son téléphone.
- Les entrées épinglées gardent l'ordre du menu. La barre retient **les quatre premières que l'utilisateur a le droit de voir**.
- Une entrée épinglée dont le libellé dépasse 12 caractères porte un libellé court (`short`).

### 3.8 Ce qui n'entre pas dans un menu

| Élément | Où il va |
|---------|----------|
| La fiche d'une ligne (un producteur, un lot, une avance) | page hors menu, ouverte depuis la liste ; l'entrée de la liste reste active |
| Un écran qui n'existe que pour une ligne (documents d'un dossier, parcours d'un producteur) | onglet de la fiche |
| Une saisie | bouton principal de la liste, à droite de l'en-tête de page |
| Le compte de l'utilisateur, la déconnexion | menu du compte, barre supérieure |
| Le changement d'application | « Applications », barre supérieure |
| La campagne | sélecteur de la barre supérieure |

---

## 4. Rendu du menu latéral

Toutes les valeurs passent par les variables d'`ARCHITECTURE.md` (§8.2). Aucune couleur en dur.

| Élément | Rendu | Variables |
|---------|-------|-----------|
| **Conteneur** | largeur fixe ; fond blanc ; bordure droite d'un pixel ; hauteur de l'écran moins la barre supérieure ; **défile seul**, sans entraîner la page ; marge intérieure 12 px en haut et en bas, 8 px sur les côtés | `--sidebar-w`, `--color-surface`, `--color-border`, `--topbar-h` |
| **Recherche** | champ de 36 px, rayon 8, icône loupe à gauche ; reste collé en haut pendant le défilement | `--color-field-border`, `--radius-field` |
| **Titre de section** | bouton sur toute la largeur, hauteur 32 px ; texte 12 px, graisse 500, majuscules, espacement des lettres 0,04 em ; chevron de 16 px à droite ; 12 px d'espace au-dessus | `--text-xs`, `--color-text-subtle` |
| **Entrée** | lien sur toute la largeur, hauteur 40 px (44 px sur écran tactile), rayon 8, 12 px de marge intérieure, 12 px entre l'icône et le texte ; icône 18 px ; libellé 14 px sur une ligne, coupé par des points de suspension | `--text-sm`, `--color-text`, `--color-text-muted`, `--touch-min` |
| Entrée survolée | fond vert très pâle | `--color-row-hover` |
| **Entrée active** | fond vert pâle ; texte et icône verts ; graisse 500 ; filet vert de 3 px à gauche, sur toute la hauteur | `--color-primary-soft`, `--color-primary-hover`, `--color-primary` |
| Entrée au focus clavier | contour de 2 px, décalé de 2 px vers l'intérieur | `--color-focus` |
| **Compteur** | pastille ocre à droite, 12 px, graisse 500, largeur minimale 20 px, chiffres tabulaires | `.pill--wait`, `--tone-wait-text`, `--tone-wait-bg` |
| Total d'une section repliée | même pastille, à gauche du chevron | `.pill--wait` |
| **Pied** | filet de séparation ; bouton « Réduire le menu » de 40 px, icône `panel-left-close` | `--color-divider` |
| Recherche sans résultat | une phrase en gris : « Aucune entrée ne correspond à « … » » | `--color-text-subtle` |
| Mouvement | section qui s'ouvre : 150 ms ; menu qui se réduit : 200 ms ; rien si l'utilisateur a demandé moins d'animations | `prefers-reduced-motion` |

Trois règles de finition :

- **L'actif ne se lit pas à la seule couleur** : il y a aussi le filet et la graisse.
- **Le libellé ne passe jamais sur deux lignes.** S'il est coupé, l'infobulle le donne en entier, suivi de l'aide.
- **Le menu ne saute pas** quand un compteur arrive : la place de la pastille est réservée à droite de chaque entrée marquée `badge`.

---

## 5. Menu réduit, tiroir et barre du bas

### 5.1 Menu réduit (ordinateur, `--sidebar-w-mini`)

- Une colonne d'icônes : **une par section**, dans l'ordre du menu. Les entrées d'une section sans titre s'affichent chacune avec sa propre icône.
- Bouton de 44 px sur 44 px, icône de 20 px, infobulle avec le titre de la section.
- La section de la page courante porte le fond vert pâle et le filet.
- Une section qui a des éléments en attente porte un **point ocre** en haut à droite de son icône (pas de nombre : il est dans le panneau).
- **Clic sur une icône** : un panneau de 248 px s'ouvre à droite, avec le titre de la section et ses entrées, rendues comme dans le menu ouvert. Il se ferme au clic en dehors, à la touche Échap et après une navigation.
- **Section d'une seule entrée** : le clic mène directement à l'écran, sans panneau.
- En bas : bouton « Ouvrir le menu », icône `panel-left-open`.
- Entre 768 et 1 023 px de large, le menu démarre réduit.

### 5.2 Tiroir (téléphone, moins de 768 px)

- Le bouton du menu de la barre supérieure, ou « Menu » dans la barre du bas, ouvre un tiroir de 288 px (86 % de l'écran au plus), sur un voile sombre.
- Le tiroir contient le menu ouvert complet, recherche comprise, avec en tête le nom de l'application et le bouton de fermeture.
- Il se ferme après une navigation, au toucher du voile et à la touche Échap. Tant qu'il est ouvert, le focus reste dedans et la page derrière ne défile pas.

### 5.3 Barre du bas (téléphone)

- Elle affiche `MenuService.mobileBar()` : **tout le menu s'il tient en cinq entrées**, sinon **les quatre premières entrées épinglées visibles**, puis « Menu ».
- Hauteur `--bottombar-h`, plus la marge de sécurité de l'appareil (`env(safe-area-inset-bottom)`). Le contenu de la page reçoit la même marge en bas.
- Chaque onglet : icône de 22 px, libellé court de 11 px dessous (`short`, sinon `label`), zone tactile d'au moins 44 px.
- Onglet actif : icône et texte verts, trait vert de 2 px en haut.
- Compteur : petite pastille ocre sur le coin de l'icône.
- La barre disparaît quand le clavier du téléphone est ouvert et pendant une saisie en pleine page.

---

## 6. Comportements

### 6.1 Ouvrir une application

1. Depuis le portail ou « Applications », l'utilisateur arrive sur `/<m>`.
2. Le routeur vérifie la session et l'accès, charge le code de l'application, puis `ModuleLayoutComponent` remet le menu de la route à `MenuService`.
3. `moduleHome` redirige vers **la première entrée que l'utilisateur a le droit d'ouvrir**.
4. Les compteurs sont demandés en un seul appel (§8).

Un utilisateur qui n'a qu'une application y arrive directement après la connexion, sans portail.

### 6.2 « Où suis-je ? »

Une seule fonction répond, `MenuService.locate(url)` : elle retient l'entrée dont l'adresse est le plus long début de l'adresse courante.

| Adresse | Entrée active | Pourquoi |
|---------|---------------|----------|
| `/terrain/pesees` | Pesées | adresse de l'entrée |
| `/terrain/pesees?statut=saisie` | Pesées | les filtres ne comptent pas |
| `/terrain/pesees/12` | Pesées | la fiche appartient à sa liste |
| `/terrain/pesees/nouvelle` | Nouvelle pesée | adresse plus longue, donc plus précise |
| `/terrain/producteurs/5` | Producteurs | la fiche appartient à sa liste |

L'entrée active, la section ouverte, l'onglet actif de la barre du bas, le fil d'Ariane et le titre de l'onglet du navigateur viennent tous de cette réponse.

### 6.3 Fil d'Ariane et titre de l'onglet

- Fil d'Ariane : **Application › Section › Entrée**, puis le nom de la fiche quand on est sur une fiche (« Comptabilité › Avances aux producteurs › Demandes d'avance › AV-2025-000001 »). Chaque niveau est un lien, sauf le dernier. Une section sans titre est omise.
- Titre de l'onglet : **`<titre de la route> · <application> · Chaîne agricole`**, posé par une `TitleStrategy` unique (`core/navigation/titre.strategy.ts`). Avec plusieurs onglets ouverts, l'utilisateur lit d'abord l'écran.

### 6.4 Ce qui est mémorisé

| Mémorisé | Où | Non mémorisé |
|----------|----|--------------|
| menu ouvert ou réduit | `STORAGE_KEYS.sidebar`, par appareil | les sections dépliées : la section courante suffit |
| dernière application ouverte | `STORAGE_KEYS.lastModule` | le texte de la recherche |
| campagne choisie | `STORAGE_KEYS.campagne` | la position de défilement du menu |

### 6.5 Recherche dans le menu

- Visible au-delà de douze entrées. Elle cherche dans le libellé, l'aide et le titre de section.
- Sans accents ni majuscules, et **par début de mot** : « caisse » trouve « Clôtures de caisse », pas « Décaissement » ; « avance verser » trouve « Décaissement » par son aide.
- Si le mot est dans le titre d'une section, la section revient entière.
- Pendant la recherche, toutes les sections qui correspondent sont dépliées. Échap vide le champ ; Entrée ouvre le premier résultat.

### 6.6 Clavier

| Touche | Effet |
|--------|-------|
| Tab | parcourt la recherche, les titres de section, puis les entrées visibles, dans l'ordre de lecture |
| Entrée ou Espace sur un titre | déplie ou replie la section |
| Entrée sur une entrée | ouvre l'écran |
| Échap | ferme le panneau du menu réduit ou le tiroir, et rend le focus au bouton qui l'a ouvert |
| « Aller au contenu » | premier lien de la page, visible au focus : il saute la barre supérieure et le menu |

Tout ce qui se fait à la souris se fait au clavier. Le focus est toujours visible.

### 6.7 Lecteurs d'écran

- Le menu est un `<nav aria-label="Menu du module">` ; la barre du bas, un `<nav aria-label="Accès rapides">`.
- Titre de section : `<button aria-expanded="true|false">`.
- Entrée active : `aria-current="page"`.
- Compteur : `aria-label="3 à traiter"`.
- Icônes : `aria-hidden="true"`. Le sens passe toujours par le libellé.
- Listes en `<ul>` et `<li>`, liens en `<a routerLink>`. Jamais de `div` cliquable.

### 6.8 Cas limites

| Cas | Comportement |
|-----|--------------|
| Les compteurs ne sont pas encore arrivés | le menu s'affiche sans eux ; pas de forme fantôme |
| L'appel des compteurs échoue | le menu reste sans compteurs ; aucun message, nouvel essai à la prochaine action |
| Changement de campagne | le menu ne change pas ; les compteurs sont redemandés |
| Section passée à `'soon'` | elle disparaît du menu ; ses adresses répondent « page introuvable » |
| Adresse sans permission | retour au portail (`permissionGuard`) |
| Pas de connexion | le menu reste utilisable ; les compteurs gardent leur dernière valeur |
| Rôle modifié par l'administrateur | pris en compte à la prochaine connexion |

---

## 7. Logique commune

### 7.1 `core/services/menu.service.ts`

Tout ce qui se calcule sur un menu est ici, et nulle part ailleurs : ce qui est visible, la barre du bas, les totaux, la position, la recherche.

```ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { ModuleId } from '../../config';
import { MenuItem, MenuSection, ModuleMenuConfig } from '../models/menu.model';
import { AuthService } from './auth.service';

/** Nombre d'entrées de la barre du bas sur téléphone. */
export const MOBILE_BAR_MAX = 5;

export interface MenuPosition { section: MenuSection; item: MenuItem; }

/** « Décaissement » → ['decaissement'] : sans accents, sans majuscules, mot par mot. */
const mots = (texte: string): string[] =>
  texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/** Chaque mot cherché doit commencer un mot du texte : « caisse » trouve « caisses », pas « décaissement ». */
const correspond = (texte: string, cherches: string[]): boolean => {
  const presents = mots(texte);
  return cherches.every(c => presents.some(p => p.startsWith(c)));
};

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly auth = inject(AuthService);
  private readonly _config = signal<ModuleMenuConfig | null>(null);
  private readonly _badges = signal<Record<string, number>>({});

  /** Module actuellement ouvert, ou null sur le portail. */
  readonly activeModule = computed<ModuleId | null>(() => this._config()?.module ?? null);

  /** Sections visibles : livrées, puis filtrées par les permissions. Une section vide disparaît. */
  readonly sections = computed<MenuSection[]>(() => {
    const cfg = this._config();
    if (!cfg) return [];
    return cfg.sections
      .filter(s => s.status !== 'soon')
      .map(s => ({ ...s, items: s.items.filter(i => !i.permission || this.auth.can(i.permission)) }))
      .filter(s => s.items.length > 0);
  });

  /** Items visibles, à plat, dans l'ordre du menu. */
  readonly items = computed<MenuItem[]>(() => this.sections().flatMap(s => s.items));

  /**
   * Barre du bas sur téléphone. Un menu de 5 entrées ou moins y tient en entier.
   * Sinon : les 4 premières entrées épinglées (pin), puis le bouton « Menu » qui ouvre le tiroir.
   */
  readonly mobileBar = computed<{ items: MenuItem[]; more: boolean }>(() => {
    const all = this.items();
    if (all.length <= MOBILE_BAR_MAX) return { items: all, more: false };
    const pinned = all.filter(i => i.pin);
    return { items: (pinned.length > 0 ? pinned : all).slice(0, MOBILE_BAR_MAX - 1), more: true };
  });

  readonly badges = this._badges.asReadonly();

  open(config: ModuleMenuConfig): void {
    this._config.set(config);
    this._badges.set({});
  }

  /** Ne vide le menu que s'il est encore celui du module qui se ferme. */
  close(module: ModuleId): void {
    if (this._config()?.module !== module) return;
    this._config.set(null);
    this._badges.set({});
  }

  setBadges(counts: Record<string, number>): void {
    this._badges.set(counts);
  }

  setBadge(itemId: string, count: number): void {
    this._badges.update(b => ({ ...b, [itemId]: count }));
  }

  /** Total des compteurs d'une section : affiché sur son titre quand elle est repliée. */
  sectionCount(section: MenuSection): number {
    const counts = this._badges();
    return section.items.reduce((total, i) => total + (i.badge ? (counts[i.id] ?? 0) : 0), 0);
  }

  /**
   * « Où suis-je ? » : l'item dont la route est le plus long début de l'adresse.
   * Une seule réponse pour l'item actif, la section ouverte, le fil d'Ariane et le titre de l'onglet.
   */
  locate(url: string): MenuPosition | null {
    const path = url.split(/[?#]/)[0];
    let best: MenuPosition | null = null;
    for (const section of this.sections()) {
      for (const item of section.items) {
        const dedans = path === item.route || path.startsWith(item.route + '/');
        if (dedans && (best === null || item.route.length > best.item.route.length)) best = { section, item };
      }
    }
    return best;
  }

  /** Recherche dans le menu : dans le titre de la section (elle revient entière), sinon dans le libellé et l'aide. */
  search(term: string): MenuSection[] {
    const cherches = mots(term);
    if (cherches.length === 0) return this.sections();
    return this.sections()
      .map(s => correspond(s.title ?? '', cherches)
        ? s
        : { ...s, items: s.items.filter(i => correspond(`${i.label} ${i.hint ?? ''}`, cherches)) })
      .filter(s => s.items.length > 0);
  }
}
```

### 7.2 Menu latéral de référence — `shared/components/sidebar/`

Le menu ouvert. Le panneau du menu réduit, le tiroir et la barre du bas lisent les mêmes signaux.

```ts
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { MenuSection } from '../../../core/models/menu.model';
import { MenuService } from '../../../core/services/menu.service';
import { IconComponent } from '../../ui/icon/icon.component';

/** Au-delà de ce nombre d'entrées visibles, le menu affiche son champ de recherche. */
const SEUIL_RECHERCHE = 12;

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, IconComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  protected readonly menu = inject(MenuService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );

  /** Position courante : donne l'item actif et la section à garder ouverte. */
  protected readonly here = computed(() => this.menu.locate(this.url()));

  protected readonly term = signal('');
  protected readonly sections = computed(() => this.menu.search(this.term()));
  protected readonly withSearch = computed(() => this.menu.items().length > SEUIL_RECHERCHE);

  /** Section que l'utilisateur a dépliée en plus de la section courante. */
  private readonly expanded = signal<string | null>(null);

  protected isOpen(section: MenuSection): boolean {
    return !section.title
      || this.term() !== ''                              // pendant une recherche, tout ce qui correspond est déplié
      || section.id === this.here()?.section.id
      || section.id === this.expanded();
  }

  protected toggle(sectionId: string): void {
    this.expanded.update(id => (id === sectionId ? null : sectionId));
  }

  protected onSearch(event: Event): void {
    this.term.set((event.target as HTMLInputElement).value);
  }
}
```

```html
<nav class="sidebar" aria-label="Menu du module">
  @if (withSearch()) {
    <label class="sidebar__search">
      <app-icon name="search" />
      <input type="search" placeholder="Rechercher dans le menu" aria-label="Rechercher dans le menu"
             [value]="term()" (input)="onSearch($event)" />
    </label>
  }

  @for (section of sections(); track section.id) {
    @if (section.title) {
      <button type="button" class="sidebar__section"
              [attr.aria-expanded]="isOpen(section)" (click)="toggle(section.id)">
        <span class="sidebar__section-title">{{ section.title }}</span>
        @if (!isOpen(section) && menu.sectionCount(section); as total) {
          <span class="pill pill--wait">{{ total > 99 ? '99+' : total }}</span>
        }
        <app-icon [name]="isOpen(section) ? 'chevron-down' : 'chevron-right'" />
      </button>
    }
    @if (isOpen(section)) {
      <ul class="sidebar__list">
        @for (item of section.items; track item.id) {
          <li>
            <a class="sidebar__item" [routerLink]="item.route" [attr.title]="item.hint"
               [class.is-active]="item.id === here()?.item?.id"
               [attr.aria-current]="item.id === here()?.item?.id ? 'page' : null">
              <app-icon [name]="item.icon" />
              <span class="sidebar__label">{{ item.label }}</span>
              @if (item.badge && menu.badges()[item.id]; as count) {
                <span class="pill pill--wait" [attr.aria-label]="count + ' à traiter'">{{ count > 99 ? '99+' : count }}</span>
              }
            </a>
          </li>
        }
      </ul>
    }
  }

  @if (term() !== '' && sections().length === 0) {
    <p class="sidebar__empty">Aucune entrée ne correspond à « {{ term() }} ».</p>
  }
</nav>
```

### 7.3 Icône — `shared/ui/icon/icon.component.ts`

```ts
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICONS, IconName } from '../../../icons';

@Component({
  selector: 'app-icon',
  template: `
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.75"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" [innerHTML]="svg()"></svg>
  `,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly name = input.required<IconName>();

  /** Le tracé vient de icons.ts, un fichier du projet : jamais d'une saisie ni de l'API. */
  protected readonly svg = computed(() => this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()]));
}
```

`icons.ts` (à la racine de `src/app/`, à côté de `config.ts`) contient le tracé de chaque icône et exporte le type `IconName`. Il est fourni dans `menus-chaine-agricole.zip` ; sa liste est au §11.

---

## 8. Compteurs

### 8.1 Le contrat

```
GET <BASE_URL>menus/compteurs?module=comptabilite&campagne_id=7

200 → { "avances-validation": 3, "avances-decaissement": 2, "tresorerie-paiements-producteurs": 12 }
```

- **Une clé = l'`id` d'une entrée** marquée `badge: true`. Une clé absente ou à zéro : pas de pastille.
- Le serveur ne renvoie que les compteurs des entrées **que l'utilisateur a le droit de voir**, calculés dans **son périmètre** (zone, dépôt) et pour **la campagne choisie**.
- Le front appelle au moment où l'application s'ouvre, après chaque action qui change un compteur (valider, verser, payer, recevoir) et au retour sur l'onglet du navigateur. **Pas de minuterie.**
- La cloche de la barre supérieure lit le compteur `alertes` de l'application `pilotage`.

### 8.2 Ce que compte chaque compteur

| Application | Entrée | Ce qu'il compte | Dans la base |
|-------------|--------|-----------------|--------------|
| Pilotage | Alertes (`alertes`) | Alertes ouvertes | `alertes.statut = 'ouverte'`, dans les zones de l'utilisateur |
| Pilotage | Approbations (`approbations`) | Décisions qui attendent l'utilisateur | `approbations.decision = 'en_attente'` et `demande_par` différent de lui |
| Producteurs et collecte | Pesées (`pesees`) | Pesées saisies, à valider | `pesees.statut = 'saisie'` |
| Producteurs et collecte | Envois au dépôt (`envois`) | Bordereaux préparés, pas encore envoyés | `bordereaux.statut = 'prepare'` |
| Dépôts et traitement | Entrées (`entrees`) | Bordereaux en route vers le dépôt | `bordereaux.statut = 'envoye'`, à destination de son dépôt |
| Dépôts et traitement | Lots au dépôt (`lots`) | Lots bloqués, à justifier | `lots.statut = 'bloque'` |
| Dépôts et traitement | Sorties (`sorties`) | Lots de vente composés dont la sortie reste à faire | lot de vente sans ligne dans `sorties_depot` *(à préciser)* |
| Ventes et import-export | Factures (`factures`) | Factures en brouillon, à émettre | `factures.statut = 'brouillon'` |
| Ventes et import-export | Encaissements (`encaissements`) | Factures dont l'échéance est dépassée | `factures.statut` à `emise` ou `payee_partiel`, et `ventes.date_echeance` passée |
| Ventes et import-export | Dossiers d'export (`dossiers-export`) | Dossiers ouverts auxquels il manque une pièce obligatoire | `dossiers_export.est_complet = 0`, avant l'embarquement *(à préciser)* |
| Comptabilité | Validation (`avances-validation`) | Demandes d'avance à décider | `avances.statut = 'proposee'` et `demande_par` différent de lui |
| Comptabilité | Décaissement (`avances-decaissement`) | Avances validées, à verser | `avances.statut = 'validee'` |
| Comptabilité | Avances sans livraison (`avances-sans-livraison`) | Avances versées sans livraison après le délai | `avances.statut = 'en_retard'` |
| Comptabilité | Paiements aux producteurs (`tresorerie-paiements-producteurs`) | Pesées validées, à payer | `pesees.statut = 'validee'` et `est_bloquee_humidite = 0` |
| Comptabilité | Encaissements clients (`tresorerie-encaissements`) | Factures à encaisser | `factures.statut` à `emise` ou `payee_partiel` |
| Comptabilité | Transferts de fonds (`tresorerie-transferts`) | Transferts envoyés vers une de ses caisses, pas encore reçus | ligne de `transferts_fonds` sans date de réception *(à préciser)* |
| Comptabilité | Dépenses (`depenses-liste`) | Dépenses saisies, à valider | `depenses` en attente de validation *(à préciser)* |
| Comptabilité | Règlements (`depenses-reglements`) | Dépenses validées, pas entièrement réglées | `depenses` validées dont les `paiements_depenses` ne couvrent pas le montant *(à préciser)* |
| Comptabilité | Écritures (`generale-ecritures`) | Écritures à l'état de brouillon | `ecritures` non validées *(à préciser)* |
| Ressources humaines | Contrats (`contrats`) | Contrats qui se terminent bientôt | `contrats_travail.date_fin` dans le délai fixé en paramètre *(à préciser)* |
| Ressources humaines | Congés (`conges`) | Demandes de congé à décider | `conges` en attente *(à préciser)* |
| Ressources humaines | Avances sur salaire (`avances-salaire`) | Demandes d'avance sur salaire à décider | `avances_salaire` en attente *(à préciser)* |
| Ressources humaines | Paiement des salaires (`paiements`) | Bulletins d'une paie validée, à payer | `bulletins` validés sans `paiements_salaires` *(à préciser)* |

Les 10 conditions marquées *à préciser* décrivent la règle sans nommer la colonne ni le statut, qui restent à relever sur le script `chaine_agricole_schema.sql`. Le script fait foi pour toutes.

---

## 9. Les 8 menus

Pour chaque application : l'aperçu du menu tel qu'il s'affiche pour qui a tous les droits, la barre du bas, puis **le fichier complet**. Dans l'aperçu, `(n)` marque une entrée à compteur.

### 9.1 Pilotage — `pilotage/pilotage.menu.ts`

Le gérant lit toute la chaîne et décide de ce qui dépasse les seuils. Il ne saisit aucune opération ici.

- **Ouverte par** : Administrateur (gérant)
- **Page d'arrivée, tous droits** : Tableau de bord (`/pilotage/tableau-de-bord`)
- **Barre du bas, tous droits** : Tableau · Zones · Alertes · Approbations · Menu

```
┌─ Pilotage ─────────────────────────────┐
│   Tableau de bord                      │
│   Collecte par zone                    │
│   Objectifs de collecte                │
│ À TRAITER                              │
│   Alertes                          (n) │
│   Approbations                     (n) │
│ SUIVI                                  │
│   Rapports                             │
└────────────────────────────────────────┘
```

```ts
import { ModuleMenuConfig } from '../core/models/menu.model';

export const PILOTAGE_MENU: ModuleMenuConfig = {
  module: 'pilotage',
  sections: [
    {
      id: 'lecture',
      items: [
        { id: 'tableau-de-bord', label: 'Tableau de bord', short: 'Tableau', icon: 'layout-dashboard',
          route: '/pilotage/tableau-de-bord', permission: 'pilotage.tableau.voir', pin: true,
          hint: 'Lire les chiffres de la campagne : avances, collecte, pertes, marge' },
        { id: 'collecte-zones', label: 'Collecte par zone', short: 'Zones', icon: 'map',
          route: '/pilotage/collecte-zones', permission: 'pilotage.tableau.voir', pin: true,
          hint: 'Comparer les zones et les superviseurs à leur objectif' },
        { id: 'objectifs', label: 'Objectifs de collecte', icon: 'target',
          route: '/pilotage/objectifs', permission: 'pilotage.objectif.voir',
          hint: "Fixer l'objectif de collecte par zone et par superviseur" },
      ],
    },
    {
      id: 'decisions', title: 'À traiter', icon: 'inbox',
      items: [
        { id: 'alertes', label: 'Alertes', icon: 'bell',
          route: '/pilotage/alertes', permission: 'pilotage.alerte.voir', badge: true, pin: true,
          hint: 'Traiter ce que le système signale : retards, pertes, écarts' },
        { id: 'approbations', label: 'Approbations', icon: 'stamp',
          route: '/pilotage/approbations', permission: 'pilotage.approbation.voir', badge: true, pin: true,
          hint: 'Approuver, réduire ou refuser ce qui attend votre décision' },
      ],
    },
    {
      id: 'suivi', title: 'Suivi', icon: 'file-chart-column',
      items: [
        { id: 'rapports', label: 'Rapports', icon: 'file-chart-column',
          route: '/pilotage/rapports', permission: 'pilotage.rapport.voir',
          hint: 'Sortir le rapport de campagne, en PDF ou en Excel' },
      ],
    },
  ],
};
```

### 9.2 Producteurs et collecte — `terrain/terrain.menu.ts`

Tout ce que le superviseur fait dans sa zone, du producteur enregistré au sac parti pour le dépôt. L'argent (avances, paiements) se traite en Comptabilité.

- **Ouverte par** : Superviseur des champs
- **Page d'arrivée, tous droits** : Producteurs (`/terrain/producteurs`)
- **Barre du bas, tous droits** : Producteurs · Peser · Pesées · Envois · Menu

```
┌─ Producteurs et collecte ──────────────┐
│ PRODUCTEURS ET CHAMPS                  │
│   Producteurs                          │
│   Champs                               │
│   Visites                              │
│   Carte et zones                       │
│ COLLECTE                               │
│   Nouvelle pesée                       │
│   Pesées                           (n) │
│   Reçus de pesée                       │
│   Envois au dépôt                  (n) │
│ SUIVI                                  │
│   Rapports                             │
└────────────────────────────────────────┘
```

```ts
import { ModuleMenuConfig } from '../core/models/menu.model';

export const TERRAIN_MENU: ModuleMenuConfig = {
  module: 'terrain',
  sections: [
    {
      id: 'producteurs', title: 'Producteurs et champs', icon: 'users',
      items: [
        { id: 'producteurs', label: 'Producteurs', icon: 'users',
          route: '/terrain/producteurs', permission: 'terrain.producteur.voir', pin: true,
          hint: 'Enregistrer les producteurs et ouvrir leur fiche' },
        { id: 'champs', label: 'Champs', icon: 'sprout',
          route: '/terrain/champs', permission: 'terrain.champ.voir',
          hint: 'Décrire chaque champ : position, surface, arbres' },
        { id: 'visites', label: 'Visites', icon: 'clipboard-list',
          route: '/terrain/visites', permission: 'terrain.visite.voir',
          hint: "Noter les visites de champ et l'estimation de récolte" },
        { id: 'carte', label: 'Carte et zones', icon: 'map-pin',
          route: '/terrain/carte', permission: 'terrain.carte.voir',
          hint: 'Voir les champs sur la carte, par zone et par état' },
      ],
    },
    {
      id: 'collecte', title: 'Collecte', icon: 'scale',
      items: [
        { id: 'nouvelle-pesee', label: 'Nouvelle pesée', short: 'Peser', icon: 'circle-plus',
          route: '/terrain/pesees/nouvelle', permission: 'terrain.pesee.saisir', pin: true,
          hint: 'Saisir une pesée : poids, humidité, sacs' },
        { id: 'pesees', label: 'Pesées', icon: 'scale',
          route: '/terrain/pesees', permission: 'terrain.pesee.voir', badge: true, pin: true,
          hint: 'Suivre les pesées : à valider, à payer, payées' },
        { id: 'recus', label: 'Reçus de pesée', icon: 'receipt',
          route: '/terrain/recus', permission: 'terrain.recu.voir',
          hint: 'Imprimer ou réimprimer un reçu de pesée' },
        { id: 'envois', label: 'Envois au dépôt', short: 'Envois', icon: 'truck',
          route: '/terrain/envois', permission: 'terrain.bordereau.voir', badge: true, pin: true,
          hint: 'Regrouper les sacs sur un bordereau et les envoyer au dépôt' },
      ],
    },
    {
      id: 'suivi', title: 'Suivi', icon: 'file-chart-column',
      items: [
        { id: 'rapports', label: 'Rapports', icon: 'file-chart-column',
          route: '/terrain/rapports', permission: 'terrain.rapport.voir',
          hint: 'Sortir la collecte par jour, par zone et par superviseur' },
      ],
    },
  ],
};
```

### 9.3 Dépôts et traitement — `depots/depots.menu.ts`

Le lot naît ici. Le responsable reçoit les bordereaux, traite, mesure les pertes et sort les lots vendus. Il ne voit que son dépôt.

- **Ouverte par** : Traitement et transformation
- **Page d'arrivée, tous droits** : Entrées (`/depots/entrees`)
- **Barre du bas, tous droits** : Entrées · Lots · Traitement · Sorties · Menu

```
┌─ Dépôts et traitement ─────────────────┐
│ RÉCEPTION ET LOTS                      │
│   Entrées                          (n) │
│   Lots au dépôt                    (n) │
│   Traitement                           │
│   Valeur avant et après                │
│   Sorties                          (n) │
│ STOCK                                  │
│   Stock et mouvements                  │
│   Inventaires                          │
│ SUIVI                                  │
│   Rapports                             │
└────────────────────────────────────────┘
```

```ts
import { ModuleMenuConfig } from '../core/models/menu.model';

export const DEPOTS_MENU: ModuleMenuConfig = {
  module: 'depots',
  sections: [
    {
      id: 'lots', title: 'Réception et lots', icon: 'layers',
      items: [
        { id: 'entrees', label: 'Entrées', icon: 'package-plus',
          route: '/depots/entrees', permission: 'depots.entree.voir', badge: true, pin: true,
          hint: 'Recevoir un bordereau : repeser et ranger les sacs dans un lot' },
        { id: 'lots', label: 'Lots au dépôt', short: 'Lots', icon: 'layers',
          route: '/depots/lots', permission: 'depots.lot.voir', badge: true, pin: true,
          hint: 'Suivre chaque lot : poids, humidité, perte, état' },
        { id: 'traitement', label: 'Traitement', icon: 'sun',
          route: '/depots/traitement', permission: 'depots.traitement.voir', pin: true,
          hint: 'Enregistrer le séchage et le tri, étape par étape' },
        { id: 'valeur', label: 'Valeur avant et après', icon: 'trending-up',
          route: '/depots/valeur', permission: 'depots.valeur.voir',
          hint: "Comparer la valeur d'un lot avant et après traitement" },
        { id: 'sorties', label: 'Sorties', icon: 'package-minus',
          route: '/depots/sorties', permission: 'depots.sortie.voir', badge: true, pin: true,
          hint: 'Sortir un lot du dépôt pour une vente' },
      ],
    },
    {
      id: 'stock', title: 'Stock', icon: 'boxes',
      items: [
        { id: 'stock', label: 'Stock et mouvements', icon: 'boxes',
          route: '/depots/stock', permission: 'depots.stock.voir',
          hint: "Lire le stock du dépôt et chaque mouvement qui l'explique" },
        { id: 'inventaires', label: 'Inventaires', icon: 'clipboard-check',
          route: '/depots/inventaires', permission: 'depots.inventaire.voir',
          hint: 'Compter le stock et constater les écarts' },
      ],
    },
    {
      id: 'suivi', title: 'Suivi', icon: 'file-chart-column',
      items: [
        { id: 'rapports', label: 'Rapports', icon: 'file-chart-column',
          route: '/depots/rapports', permission: 'depots.rapport.voir',
          hint: 'Sortir le stock, les pertes et les durées de séchage' },
      ],
    },
  ],
};
```

### 9.4 Ventes et import-export — `ventes/ventes.menu.ts`

Une seule application pour vendre et expédier. Le rôle Ventes voit les deux premières sections, le rôle Import-export la troisième : le menu se filtre par permission.

- **Ouverte par** : Ventes et marges · Import-export
- **Page d'arrivée, tous droits** : Clients (`/ventes/clients`)
- **Barre du bas, tous droits** : Clients · Lots · Contrats · Factures · Menu

```
┌─ Ventes et import-export ──────────────┐
│ VENTES                                 │
│   Clients                              │
│   Lots de vente                        │
│   Contrats et prix                     │
│   Factures                         (n) │
│   Encaissements                    (n) │
│ COÛTS ET MARGES                        │
│   Coût de revient                      │
│   Marges                               │
│ IMPORT-EXPORT                          │
│   Dossiers d'export                (n) │
│   Suivi des expéditions                │
│   Dossiers d'import                    │
│   Documents exigés                     │
│ SUIVI                                  │
│   Rapports                             │
└────────────────────────────────────────┘
```

```ts
import { ModuleMenuConfig } from '../core/models/menu.model';

export const VENTES_MENU: ModuleMenuConfig = {
  module: 'ventes',
  sections: [
    {
      id: 'ventes', title: 'Ventes', icon: 'handshake',
      items: [
        { id: 'clients', label: 'Clients', icon: 'building-2',
          route: '/ventes/clients', permission: 'ventes.client.voir', pin: true,
          hint: 'Tenir la fiche des acheteurs et leurs conditions' },
        { id: 'lots-vente', label: 'Lots de vente', short: 'Lots', icon: 'package-check',
          route: '/ventes/lots-vente', permission: 'ventes.lot-vente.voir', pin: true,
          hint: 'Composer un lot de vente à partir des lots prêts' },
        { id: 'contrats', label: 'Contrats et prix', short: 'Contrats', icon: 'handshake',
          route: '/ventes/contrats', permission: 'ventes.contrat.voir', pin: true,
          hint: 'Enregistrer la vente : prix, devise, taux, livraison' },
        { id: 'factures', label: 'Factures', icon: 'file-text',
          route: '/ventes/factures', permission: 'ventes.facture.voir', badge: true, pin: true,
          hint: 'Émettre les factures et les avoirs' },
        { id: 'encaissements', label: 'Encaissements', icon: 'coins',
          route: '/ventes/encaissements', permission: 'ventes.encaissement.voir', badge: true,
          hint: "Voir ce que chaque client a payé et ce qu'il doit" },
      ],
    },
    {
      id: 'marges', title: 'Coûts et marges', icon: 'calculator',
      items: [
        { id: 'cout-revient', label: 'Coût de revient', icon: 'calculator',
          route: '/ventes/cout-revient', permission: 'ventes.cout.voir',
          hint: "Lire le coût d'un lot : achat, transport, traitement, frais" },
        { id: 'marges', label: 'Marges', icon: 'badge-percent',
          route: '/ventes/marges', permission: 'ventes.marge.voir',
          hint: 'Lire la marge par lot, par client et par kilo' },
      ],
    },
    {
      id: 'import-export', title: 'Import-export', icon: 'ship',
      items: [
        { id: 'dossiers-export', label: "Dossiers d'export", short: 'Export', icon: 'ship',
          route: '/ventes/dossiers-export', permission: 'ventes.dossier-export.voir', badge: true, pin: true,
          hint: 'Ouvrir un dossier par expédition et réunir ses documents' },
        { id: 'expeditions', label: 'Suivi des expéditions', short: 'Expéditions', icon: 'container',
          route: '/ventes/expeditions', permission: 'ventes.expedition.voir', pin: true,
          hint: "Suivre chaque expédition jusqu'à la livraison" },
        { id: 'dossiers-import', label: "Dossiers d'import", short: 'Import', icon: 'package-open',
          route: '/ventes/dossiers-import', permission: 'ventes.dossier-import.voir',
          hint: "Suivre les achats à l'étranger et leur coût rendu" },
        { id: 'documents-exiges', label: 'Documents exigés', short: 'Documents', icon: 'list-checks',
          route: '/ventes/documents-exiges', permission: 'ventes.type-document.voir',
          hint: 'Fixer la liste des documents exigés pour un dossier' },
      ],
    },
    {
      id: 'suivi', title: 'Suivi', icon: 'file-chart-column',
      items: [
        { id: 'rapports', label: 'Rapports', icon: 'file-chart-column',
          route: '/ventes/rapports', permission: 'ventes.rapport.voir',
          hint: 'Sortir les ventes, les marges et les dossiers' },
      ],
    },
  ],
};
```

### 9.5 Comptabilité — `comptabilite/comptabilite.menu.ts`

Tout l'argent au même endroit : les avances aux producteurs, les caisses et les banques, les dépenses, puis la comptabilité générale SYSCOHADA.

- **Ouverte par** : Comptabilité (et le superviseur pour ses demandes d'avance)
- **Page d'arrivée, tous droits** : Demandes d'avance (`/comptabilite/avances/demandes`)
- **Barre du bas, tous droits** : Validation · Décaissement · Journal · Paiements · Menu
- **Sections fermées** (`status: 'soon'`) : Comptabilité générale, Clôtures et états, Paramétrage comptable

```
┌─ Comptabilité ─────────────────────────┐
│ [ Rechercher dans le menu ]            │
│                                        │
│ AVANCES AUX PRODUCTEURS                │
│   Demandes d'avance                    │
│   Validation                       (n) │
│   Décaissement                     (n) │
│   Suivi des remboursements             │
│   Avances sans livraison           (n) │
│ TRÉSORERIE                             │
│   Caisses et comptes                   │
│   Journal de caisse et banque          │
│   Paiements aux producteurs        (n) │
│   Encaissements clients            (n) │
│   Transferts de fonds              (n) │
│   Clôtures de caisse                   │
│   Rapprochements bancaires             │
│ DÉPENSES                               │
│   Dépenses                         (n) │
│   Règlements                       (n) │
│   Fournisseurs                         │
│   Natures de dépense                   │
│ COÛTS ET RÉSULTAT                      │
│   Coût de revient                      │
│   Résultat de campagne                 │
│   Rapports et exports                  │
│ COMPTABILITÉ GÉNÉRALE         (fermée) │
│   Écritures                        (n) │
│   Grand livre                          │
│   Balance générale                     │
│   Balance des tiers                    │
│   Lettrage                             │
│ CLÔTURES ET ÉTATS             (fermée) │
│   Exercices et périodes                │
│   Immobilisations                      │
│   États financiers                     │
│ PARAMÉTRAGE COMPTABLE         (fermée) │
│   Plan de comptes                      │
│   Journaux                             │
│   Tiers                                │
│   Modèles d'écritures                  │
│   Comptes par produit                  │
│   Taxes                                │
└────────────────────────────────────────┘
```

```ts
import { ModuleMenuConfig } from '../core/models/menu.model';

export const COMPTABILITE_MENU: ModuleMenuConfig = {
  module: 'comptabilite',
  sections: [
    {
      id: 'avances', title: 'Avances aux producteurs', icon: 'hand-coins',
      items: [
        { id: 'avances-demandes', label: "Demandes d'avance", short: 'Demandes', icon: 'hand-coins',
          route: '/comptabilite/avances/demandes', permission: 'comptabilite.avance.voir',
          hint: 'Proposer une avance et suivre les demandes' },
        { id: 'avances-validation', label: 'Validation', icon: 'stamp',
          route: '/comptabilite/avances/validation', permission: 'comptabilite.avance.valider', badge: true, pin: true,
          hint: "Approuver, réduire ou refuser les demandes d'avance" },
        { id: 'avances-decaissement', label: 'Décaissement', icon: 'banknote',
          route: '/comptabilite/avances/decaissement', permission: 'comptabilite.avance.verser', badge: true, pin: true,
          hint: 'Verser les avances validées et joindre le reçu signé' },
        { id: 'avances-remboursements', label: 'Suivi des remboursements', icon: 'repeat',
          route: '/comptabilite/avances/remboursements', permission: 'comptabilite.remboursement.voir',
          hint: 'Voir, par producteur, ce qui est retenu et ce qui reste dû' },
        { id: 'avances-sans-livraison', label: 'Avances sans livraison', icon: 'hourglass',
          route: '/comptabilite/avances/sans-livraison', permission: 'comptabilite.retard.voir', badge: true,
          hint: "Relancer les producteurs qui n'ont rien livré après le délai" },
      ],
    },
    {
      id: 'tresorerie', title: 'Trésorerie', icon: 'wallet',
      items: [
        { id: 'tresorerie-comptes', label: 'Caisses et comptes', icon: 'wallet',
          route: '/comptabilite/tresorerie/comptes', permission: 'comptabilite.tresorerie.voir',
          hint: 'Lire le solde de chaque caisse, banque et compte Orange Money' },
        { id: 'tresorerie-journal', label: 'Journal de caisse et banque', short: 'Journal', icon: 'book-open',
          route: '/comptabilite/tresorerie/journal', permission: 'comptabilite.tresorerie.voir', pin: true,
          hint: "Lire chaque entrée et sortie d'argent, avec son origine" },
        { id: 'tresorerie-paiements-producteurs', label: 'Paiements aux producteurs', short: 'Paiements', icon: 'users',
          route: '/comptabilite/tresorerie/paiements-producteurs', permission: 'comptabilite.paiement-producteur.voir', badge: true, pin: true,
          hint: 'Payer le net des pesées validées' },
        { id: 'tresorerie-encaissements', label: 'Encaissements clients', icon: 'coins',
          route: '/comptabilite/tresorerie/encaissements', permission: 'comptabilite.encaissement.voir', badge: true,
          hint: 'Enregistrer les paiements reçus des clients' },
        { id: 'tresorerie-transferts', label: 'Transferts de fonds', icon: 'arrow-left-right',
          route: '/comptabilite/tresorerie/transferts', permission: 'comptabilite.transfert.voir', badge: true,
          hint: "Envoyer des fonds d'une caisse à une autre" },
        { id: 'tresorerie-clotures-caisse', label: 'Clôtures de caisse', icon: 'lock',
          route: '/comptabilite/tresorerie/clotures-caisse', permission: 'comptabilite.cloture-caisse.voir',
          hint: "Compter la caisse et constater l'écart" },
        { id: 'tresorerie-rapprochements', label: 'Rapprochements bancaires', icon: 'check-check',
          route: '/comptabilite/tresorerie/rapprochements', permission: 'comptabilite.rapprochement.voir',
          hint: 'Pointer les mouvements avec le relevé de la banque' },
      ],
    },
    {
      id: 'depenses', title: 'Dépenses', icon: 'receipt-text',
      items: [
        { id: 'depenses-liste', label: 'Dépenses', icon: 'receipt-text',
          route: '/comptabilite/depenses/liste', permission: 'comptabilite.depense.voir', badge: true, pin: true,
          hint: "Saisir une dépense et l'imputer à un lot ou à un dossier" },
        { id: 'depenses-reglements', label: 'Règlements', icon: 'credit-card',
          route: '/comptabilite/depenses/reglements', permission: 'comptabilite.reglement.voir', badge: true,
          hint: 'Régler les dépenses validées' },
        { id: 'depenses-fournisseurs', label: 'Fournisseurs', icon: 'store',
          route: '/comptabilite/depenses/fournisseurs', permission: 'comptabilite.fournisseur.voir',
          hint: 'Tenir la fiche des transporteurs, transitaires et prestataires' },
        { id: 'depenses-natures', label: 'Natures de dépense', icon: 'tags',
          route: '/comptabilite/depenses/natures', permission: 'comptabilite.nature-depense.voir',
          hint: "Classer les dépenses : transport, emballage, frais d'export…" },
      ],
    },
    {
      id: 'analyse', title: 'Coûts et résultat', icon: 'chart-column',
      items: [
        { id: 'analyse-cout-revient', label: 'Coût de revient', icon: 'calculator',
          route: '/comptabilite/analyse/cout-revient', permission: 'comptabilite.cout.voir',
          hint: 'Lire le coût de revient par lot et par kilo' },
        { id: 'analyse-resultat-campagne', label: 'Résultat de campagne', icon: 'chart-column',
          route: '/comptabilite/analyse/resultat-campagne', permission: 'comptabilite.resultat.voir',
          hint: 'Lire le résultat de la campagne, par produit' },
        { id: 'analyse-exports', label: 'Rapports et exports', icon: 'file-chart-column',
          route: '/comptabilite/analyse/exports', permission: 'comptabilite.export.faire',
          hint: 'Sortir les journaux et les états, en PDF ou en Excel' },
      ],
    },
    {
      id: 'generale', title: 'Comptabilité générale', icon: 'notebook-pen', status: 'soon',
      items: [
        { id: 'generale-ecritures', label: 'Écritures', icon: 'notebook-pen',
          route: '/comptabilite/generale/ecritures', permission: 'comptabilite.ecriture.voir', badge: true,
          hint: 'Consulter les écritures et saisir les opérations diverses' },
        { id: 'generale-grand-livre', label: 'Grand livre', icon: 'book-text',
          route: '/comptabilite/generale/grand-livre', permission: 'comptabilite.livre.voir',
          hint: "Lire le détail d'un compte, ligne par ligne" },
        { id: 'generale-balance', label: 'Balance générale', icon: 'sigma',
          route: '/comptabilite/generale/balance', permission: 'comptabilite.livre.voir',
          hint: 'Lire le total de chaque compte sur une période' },
        { id: 'generale-balance-tiers', label: 'Balance des tiers', icon: 'book-user',
          route: '/comptabilite/generale/balance-tiers', permission: 'comptabilite.livre.voir',
          hint: "Lire ce qui est dû à chaque tiers et ce qu'il doit" },
        { id: 'generale-lettrage', label: 'Lettrage', icon: 'link',
          route: '/comptabilite/generale/lettrage', permission: 'comptabilite.lettrage.voir',
          hint: 'Rapprocher une dette de son règlement' },
      ],
    },
    {
      id: 'clotures', title: 'Clôtures et états', icon: 'calendar-clock', status: 'soon',
      items: [
        { id: 'clotures-exercices', label: 'Exercices et périodes', icon: 'calendar-clock',
          route: '/comptabilite/clotures/exercices', permission: 'comptabilite.exercice.voir',
          hint: "Ouvrir et clôturer les mois et l'exercice" },
        { id: 'clotures-immobilisations', label: 'Immobilisations', icon: 'tractor',
          route: '/comptabilite/clotures/immobilisations', permission: 'comptabilite.immobilisation.voir',
          hint: 'Suivre les biens durables et leur amortissement' },
        { id: 'clotures-etats-financiers', label: 'États financiers', icon: 'file-spreadsheet',
          route: '/comptabilite/clotures/etats-financiers', permission: 'comptabilite.etat.voir',
          hint: 'Sortir le bilan, le compte de résultat et les flux' },
      ],
    },
    {
      id: 'parametrage', title: 'Paramétrage comptable', icon: 'sliders-horizontal', status: 'soon',
      items: [
        { id: 'parametrage-plan-comptes', label: 'Plan de comptes', icon: 'list-tree',
          route: '/comptabilite/parametrage/plan-comptes', permission: 'comptabilite.compte.voir',
          hint: 'Tenir le plan de comptes SYSCOHADA' },
        { id: 'parametrage-journaux', label: 'Journaux', icon: 'library',
          route: '/comptabilite/parametrage/journaux', permission: 'comptabilite.journal.voir',
          hint: 'Tenir les journaux comptables' },
        { id: 'parametrage-tiers', label: 'Tiers', icon: 'contact',
          route: '/comptabilite/parametrage/tiers', permission: 'comptabilite.tiers.voir',
          hint: 'Tenir les comptes des producteurs, clients et fournisseurs' },
        { id: 'parametrage-modeles-ecritures', label: "Modèles d'écritures", icon: 'workflow',
          route: '/comptabilite/parametrage/modeles-ecritures', permission: 'comptabilite.modele.voir',
          hint: "Régler l'écriture produite par chaque opération" },
        { id: 'parametrage-comptes-produits', label: 'Comptes par produit', icon: 'wheat',
          route: '/comptabilite/parametrage/comptes-produits', permission: 'comptabilite.compte.voir',
          hint: "Choisir les comptes d'achat, de stock et de vente d'un produit" },
        { id: 'parametrage-taxes', label: 'Taxes', icon: 'percent',
          route: '/comptabilite/parametrage/taxes', permission: 'comptabilite.taxe.voir',
          hint: 'Tenir les taxes, leurs taux et leurs comptes' },
      ],
    },
  ],
};
```

### 9.6 Ressources humaines — `rh/rh.menu.ts`

Le personnel, son temps et sa paie, jusqu'au paiement des salaires. Module complet et indépendant : il se livre ou non sans toucher aux autres.

- **Ouverte par** : Extension, hors de l'offre signée
- **Page d'arrivée, tous droits** : Employés (`/rh/employes`)
- **Barre du bas, tous droits** : Employés · Présences · Congés · Paie du mois · Menu
- **Application entière hors de l'offre signée** : elle reste `status: 'soon'` dans `config.ts` jusqu'à décision

```
┌─ Ressources humaines ──────────────────┐
│ PERSONNEL                              │
│   Employés                             │
│   Contrats                         (n) │
│   Services et postes                   │
│ TEMPS DE TRAVAIL                       │
│   Présences                            │
│   Congés                           (n) │
│   Missions                             │
│ PAIE                                   │
│   Paie du mois                         │
│   Bulletins                            │
│   Avances sur salaire              (n) │
│   Paiement des salaires            (n) │
│   Rubriques et barème                  │
│ SUIVI                                  │
│   Rapports                             │
└────────────────────────────────────────┘
```

```ts
import { ModuleMenuConfig } from '../core/models/menu.model';

export const RH_MENU: ModuleMenuConfig = {
  module: 'rh',
  sections: [
    {
      id: 'personnel', title: 'Personnel', icon: 'id-card',
      items: [
        { id: 'employes', label: 'Employés', icon: 'id-card',
          route: '/rh/employes', permission: 'rh.employe.voir', pin: true,
          hint: 'Tenir le dossier de chaque employé' },
        { id: 'contrats', label: 'Contrats', icon: 'scroll-text',
          route: '/rh/contrats', permission: 'rh.contrat.voir', badge: true,
          hint: 'Enregistrer les contrats et surveiller leurs échéances' },
        { id: 'organisation', label: 'Services et postes', icon: 'network',
          route: '/rh/organisation', permission: 'rh.organisation.voir',
          hint: 'Décrire les services et les postes' },
      ],
    },
    {
      id: 'temps', title: 'Temps de travail', icon: 'calendar-check',
      items: [
        { id: 'presences', label: 'Présences', icon: 'calendar-check',
          route: '/rh/presences', permission: 'rh.presence.voir', pin: true,
          hint: 'Pointer les présences, jour par jour' },
        { id: 'conges', label: 'Congés', icon: 'tree-palm',
          route: '/rh/conges', permission: 'rh.conge.voir', badge: true, pin: true,
          hint: 'Demander et approuver les congés' },
        { id: 'missions', label: 'Missions', icon: 'route',
          route: '/rh/missions', permission: 'rh.mission.voir',
          hint: 'Préparer les déplacements et leurs frais' },
      ],
    },
    {
      id: 'paie', title: 'Paie', icon: 'banknote',
      items: [
        { id: 'paie', label: 'Paie du mois', icon: 'calculator',
          route: '/rh/paie', permission: 'rh.paie.voir', pin: true,
          hint: 'Saisir les éléments du mois, calculer et valider la paie' },
        { id: 'bulletins', label: 'Bulletins', icon: 'file-user',
          route: '/rh/bulletins', permission: 'rh.bulletin.voir',
          hint: 'Consulter et imprimer les bulletins de paie' },
        { id: 'avances-salaire', label: 'Avances sur salaire', icon: 'hand-coins',
          route: '/rh/avances-salaire', permission: 'rh.avance-salaire.voir', badge: true,
          hint: 'Accorder une avance et suivre ses retenues' },
        { id: 'paiements', label: 'Paiement des salaires', icon: 'banknote',
          route: '/rh/paiements', permission: 'rh.salaire.voir', badge: true,
          hint: "Payer les salaires d'une paie validée" },
        { id: 'rubriques', label: 'Rubriques et barème', icon: 'sliders-horizontal',
          route: '/rh/rubriques', permission: 'rh.rubrique.voir',
          hint: 'Régler les rubriques de paie et le barème' },
      ],
    },
    {
      id: 'suivi', title: 'Suivi', icon: 'file-chart-column',
      items: [
        { id: 'rapports', label: 'Rapports', icon: 'file-chart-column',
          route: '/rh/rapports', permission: 'rh.rapport.voir',
          hint: "Sortir l'effectif, les présences et le journal de paie" },
      ],
    },
  ],
};
```

### 9.7 Administration — `administration/administration.menu.ts`

Le socle : qui a le droit de faire quoi, et les règles que tous les autres modules lisent. Ouvert dès l'étape 1.

- **Ouverte par** : Administrateur (gérant)
- **Page d'arrivée, tous droits** : Utilisateurs (`/administration/utilisateurs`)
- **Barre du bas, tous droits** : Utilisateurs · Produits · Campagnes · Paramètres · Menu

```
┌─ Administration ───────────────────────┐
│ [ Rechercher dans le menu ]            │
│                                        │
│ ACCÈS                                  │
│   Utilisateurs                         │
│   Rôles et droits                      │
│ RÉFÉRENTIELS                           │
│   Produits et règles                   │
│   Campagnes                            │
│   Zones                                │
│   Dépôts                               │
│ RÉGLAGES                               │
│   Paramètres et seuils                 │
│   Devises et taux de change            │
│   Société                              │
│   Numérotation                         │
│ TRAÇABILITÉ                            │
│   Journal d'audit                      │
│   Connexions                           │
│   Documents émis                       │
└────────────────────────────────────────┘
```

```ts
import { ModuleMenuConfig } from '../core/models/menu.model';

export const ADMINISTRATION_MENU: ModuleMenuConfig = {
  module: 'administration',
  sections: [
    {
      id: 'acces', title: 'Accès', icon: 'key-round',
      items: [
        { id: 'utilisateurs', label: 'Utilisateurs', icon: 'user-cog',
          route: '/administration/utilisateurs', permission: 'administration.utilisateur.voir', pin: true,
          hint: 'Créer les comptes, fixer leur rôle et leur périmètre' },
        { id: 'roles', label: 'Rôles et droits', icon: 'key-round',
          route: '/administration/roles', permission: 'administration.role.voir',
          hint: 'Régler ce que chaque rôle peut voir, saisir, valider et payer' },
      ],
    },
    {
      id: 'referentiels', title: 'Référentiels', icon: 'database',
      items: [
        { id: 'produits', label: 'Produits et règles', short: 'Produits', icon: 'wheat',
          route: '/administration/produits', permission: 'administration.produit.voir', pin: true,
          hint: "Régler chaque produit : seuils, prix d'achat, étapes" },
        { id: 'campagnes', label: 'Campagnes', icon: 'calendar-range',
          route: '/administration/campagnes', permission: 'administration.campagne.voir', pin: true,
          hint: "Ouvrir et clôturer les campagnes d'un produit" },
        { id: 'zones', label: 'Zones', icon: 'map',
          route: '/administration/zones', permission: 'administration.zone.voir',
          hint: "Tenir l'arbre des zones, de la région au village" },
        { id: 'depots', label: 'Dépôts', icon: 'warehouse',
          route: '/administration/depots', permission: 'administration.depot.voir',
          hint: 'Tenir la liste des dépôts et leur capacité' },
      ],
    },
    {
      id: 'reglages', title: 'Réglages', icon: 'sliders-horizontal',
      items: [
        { id: 'parametres', label: 'Paramètres et seuils', short: 'Paramètres', icon: 'sliders-horizontal',
          route: '/administration/parametres', permission: 'administration.parametre.voir', pin: true,
          hint: "Fixer les seuils et les délais, à partir d'une date" },
        { id: 'devises', label: 'Devises et taux de change', icon: 'circle-dollar-sign',
          route: '/administration/devises', permission: 'administration.devise.voir',
          hint: 'Tenir les devises et saisir le taux du jour' },
        { id: 'societe', label: 'Société', icon: 'building',
          route: '/administration/societe', permission: 'administration.societe.voir',
          hint: "Tenir l'identité de l'entreprise, imprimée sur les documents" },
        { id: 'numerotation', label: 'Numérotation', icon: 'hash',
          route: '/administration/numerotation', permission: 'administration.compteur.voir',
          hint: 'Régler le format des numéros de documents' },
      ],
    },
    {
      id: 'tracabilite', title: 'Traçabilité', icon: 'history',
      items: [
        { id: 'audit', label: "Journal d'audit", icon: 'history',
          route: '/administration/audit', permission: 'administration.audit.voir',
          hint: 'Chercher qui a fait quoi, quand, avec les valeurs avant et après' },
        { id: 'connexions', label: 'Connexions', icon: 'log-in',
          route: '/administration/connexions', permission: 'administration.connexion.voir',
          hint: 'Voir les connexions réussies et refusées' },
        { id: 'documents', label: 'Documents émis', icon: 'file-check',
          route: '/administration/documents', permission: 'administration.document.voir',
          hint: 'Retrouver un document émis et vérifier son code' },
      ],
    },
  ],
};
```

### 9.8 Mon espace — `mon-espace/mon-espace.menu.ts`

Le producteur lit son propre compte sur son téléphone. Lecture seule, cinq écrans, aucune table à lui.

- **Ouverte par** : Producteur
- **Page d'arrivée, tous droits** : Mon compte (`/mon-espace/compte`)
- **Barre du bas, tous droits** : Compte · Livraisons · Paiements · Avances · Champs

```
┌─ Mon espace ───────────────────────────┐
│   Mon compte                           │
│   Mes livraisons                       │
│   Mes paiements                        │
│   Mes avances                          │
│   Mes champs                           │
└────────────────────────────────────────┘
```

```ts
import { ModuleMenuConfig } from '../core/models/menu.model';

export const MON_ESPACE_MENU: ModuleMenuConfig = {
  module: 'mon-espace',
  sections: [
    {
      id: 'compte',
      items: [
        { id: 'compte', label: 'Mon compte', short: 'Compte', icon: 'user',
          route: '/mon-espace/compte', permission: 'mon-espace.compte.voir',
          hint: 'Votre situation de la campagne, en un écran' },
        { id: 'livraisons', label: 'Mes livraisons', short: 'Livraisons', icon: 'scale',
          route: '/mon-espace/livraisons', permission: 'mon-espace.compte.voir',
          hint: 'Vos pesées, avec la date, le poids et le montant' },
        { id: 'paiements', label: 'Mes paiements', short: 'Paiements', icon: 'banknote',
          route: '/mon-espace/paiements', permission: 'mon-espace.compte.voir',
          hint: 'Ce que vous avez reçu, et vos reçus à télécharger' },
        { id: 'avances', label: 'Mes avances', short: 'Avances', icon: 'hand-coins',
          route: '/mon-espace/avances', permission: 'mon-espace.compte.voir',
          hint: 'Votre avance, ce qui est remboursé et ce qui reste' },
        { id: 'champs', label: 'Mes champs', short: 'Champs', icon: 'sprout',
          route: '/mon-espace/champs', permission: 'mon-espace.compte.voir',
          hint: 'Vos champs et les visites du superviseur' },
      ],
    },
  ],
};
```

---

## 10. Ce que voit chaque rôle

### 10.1 Les sept utilisateurs de démonstration

Un par espace de l'offre signée. La répartition des droits est une **proposition**, reprise du guide des 11 modules : elle se règle dans la base (`roles`, `role_permissions`), jamais dans le front.

| Clé | Espace | Téléphone de démonstration | Périmètre | Ce qu'il peut faire | Permissions | Applications | Arrivée après la connexion |
|-----|--------|----------------------------|-----------|---------------------|-------------|--------------|----------------------------|
| `gerant` | Administrateur (gérant) | `620000001` | toute l'entreprise | toutes les permissions, sauf celles de Mon espace | 169 | Pilotage, Producteurs et collecte, Dépôts et traitement, Ventes et import-export, Comptabilité, Ressources humaines, Administration | `/portail` |
| `comptable` | Comptabilité | `620000002` | toute l'entreprise | verse, paie, encaisse et saisit ; ne demande pas et ne valide pas | 28 | Comptabilité | `/comptabilite/avances/demandes` |
| `superviseur` | Superviseur des champs | `620000003` | zone de Kolaboui | saisit dans sa zone ; propose les avances | 16 | Producteurs et collecte, Comptabilité | `/portail` |
| `traitement` | Traitement et transformation | `620000004` | dépôt de Kolaboui | saisit dans son dépôt ; ne valide pas l'inventaire | 14 | Dépôts et traitement | `/depots/entrees` |
| `ventes` | Ventes et marges | `620000005` | toute l'entreprise | vend et facture ; n'annule pas une facture | 13 | Ventes et import-export | `/ventes/clients` |
| `import-export` | Import-export | `620000006` | toute l'entreprise | tient les dossiers ; ne valide pas les documents | 9 | Ventes et import-export | `/ventes/dossiers-export` |
| `producteur` | Producteur | `620000007` | son propre compte | lit son compte, rien d'autre | 1 | Mon espace | `/mon-espace/compte` |

`auth/data/utilisateurs-demo.mock.ts` (la liste du gérant est abrégée ici ; le fichier complet est dans `menus-chaine-agricole.zip`) :

```ts
import { AuthUser } from '../../core/models/user.model';

/**
 * Un utilisateur de démonstration par espace de l'offre, pour vérifier les menus rôle par rôle.
 * Répartition des droits proposée : elle se règle ensuite dans la base (roles, role_permissions).
 */
export const UTILISATEURS_DEMO = {
  'gerant': {
    id: 1, nom: 'Démo', prenom: 'Gérant', initiales: 'GD', telephone: '620000001',
    role: { code: 'administrateur', libelle: 'Administrateur (gérant)' },
    perimetre: { zone_ids: [], depot_ids: [] }, producteur_id: null, est_mot_de_passe_provisoire: false,
    permissions: [
      // les 169 permissions des tableaux d'ARCHITECTURE.md (§12), c'est-à-dire toutes sauf 'mon-espace.compte.voir'
    ],
  },
  'comptable': {
    id: 2, nom: 'Démo', prenom: 'Comptable', initiales: 'CD', telephone: '620000002',
    role: { code: 'comptabilite', libelle: 'Comptabilité' },
    perimetre: { zone_ids: [], depot_ids: [] }, producteur_id: null, est_mot_de_passe_provisoire: false,
    permissions: [
      'comptabilite.avance.voir', 'comptabilite.avance.verser', 'comptabilite.avance.rembourser',
      'comptabilite.remboursement.voir', 'comptabilite.retard.voir', 'comptabilite.tresorerie.voir',
      'comptabilite.tresorerie.saisir', 'comptabilite.paiement-producteur.voir',
      'comptabilite.paiement-producteur.payer', 'comptabilite.encaissement.voir', 'comptabilite.encaissement.saisir',
      'comptabilite.transfert.voir', 'comptabilite.transfert.demander', 'comptabilite.transfert.recevoir',
      'comptabilite.cloture-caisse.voir', 'comptabilite.cloture-caisse.saisir', 'comptabilite.rapprochement.voir',
      'comptabilite.rapprochement.saisir', 'comptabilite.depense.voir', 'comptabilite.depense.saisir',
      'comptabilite.reglement.voir', 'comptabilite.reglement.payer', 'comptabilite.fournisseur.voir',
      'comptabilite.fournisseur.saisir', 'comptabilite.nature-depense.voir', 'comptabilite.cout.voir',
      'comptabilite.resultat.voir', 'comptabilite.export.faire',
    ],
  },
  'superviseur': {
    id: 3, nom: 'Démo', prenom: 'Superviseur', initiales: 'SD', telephone: '620000003',
    role: { code: 'superviseur', libelle: 'Superviseur des champs' },
    perimetre: { zone_ids: [1], depot_ids: [] }, producteur_id: null, est_mot_de_passe_provisoire: false,
    permissions: [
      'terrain.producteur.voir', 'terrain.producteur.saisir', 'terrain.champ.voir', 'terrain.champ.saisir',
      'terrain.visite.voir', 'terrain.visite.saisir', 'terrain.carte.voir', 'terrain.pesee.saisir',
      'terrain.pesee.voir', 'terrain.pesee.valider', 'terrain.recu.voir', 'terrain.bordereau.voir',
      'terrain.bordereau.saisir', 'terrain.rapport.voir', 'comptabilite.avance.voir', 'comptabilite.avance.demander',
    ],
  },
  'traitement': {
    id: 4, nom: 'Démo', prenom: 'Dépôt', initiales: 'DD', telephone: '620000004',
    role: { code: 'traitement', libelle: 'Traitement et transformation' },
    perimetre: { zone_ids: [], depot_ids: [1] }, producteur_id: null, est_mot_de_passe_provisoire: false,
    permissions: [
      'depots.entree.voir', 'depots.entree.saisir', 'depots.lot.voir', 'depots.lot.justifier',
      'depots.traitement.voir', 'depots.traitement.saisir', 'depots.mesure.saisir', 'depots.valeur.voir',
      'depots.sortie.voir', 'depots.sortie.saisir', 'depots.stock.voir', 'depots.inventaire.voir',
      'depots.inventaire.saisir', 'depots.rapport.voir',
    ],
  },
  'ventes': {
    id: 5, nom: 'Démo', prenom: 'Ventes', initiales: 'VD', telephone: '620000005',
    role: { code: 'ventes', libelle: 'Ventes et marges' },
    perimetre: { zone_ids: [], depot_ids: [] }, producteur_id: null, est_mot_de_passe_provisoire: false,
    permissions: [
      'ventes.client.voir', 'ventes.client.saisir', 'ventes.lot-vente.voir', 'ventes.lot-vente.saisir',
      'ventes.contrat.voir', 'ventes.contrat.saisir', 'ventes.contrat.confirmer', 'ventes.facture.voir',
      'ventes.facture.emettre', 'ventes.encaissement.voir', 'ventes.cout.voir', 'ventes.marge.voir',
      'ventes.rapport.voir',
    ],
  },
  'import-export': {
    id: 6, nom: 'Démo', prenom: 'Export', initiales: 'ED', telephone: '620000006',
    role: { code: 'import-export', libelle: 'Import-export' },
    perimetre: { zone_ids: [], depot_ids: [] }, producteur_id: null, est_mot_de_passe_provisoire: false,
    permissions: [
      'ventes.dossier-export.voir', 'ventes.dossier-export.saisir', 'ventes.frais.saisir', 'ventes.expedition.voir',
      'ventes.expedition.saisir', 'ventes.dossier-import.voir', 'ventes.dossier-import.saisir',
      'ventes.type-document.voir', 'ventes.rapport.voir',
    ],
  },
  'producteur': {
    id: 7, nom: 'Camara', prenom: 'Sékou', initiales: 'SC', telephone: '620000007',
    role: { code: 'producteur', libelle: 'Producteur' },
    perimetre: { zone_ids: [], depot_ids: [] }, producteur_id: 1, est_mot_de_passe_provisoire: false,
    permissions: [
      'mon-espace.compte.voir',
    ],
  },
} satisfies Record<string, AuthUser>;

export type CleDemo = keyof typeof UTILISATEURS_DEMO;
```

### 10.2 Les menus obtenus

Ces tableaux sortent de l'exécution de `MenuService` avec chaque utilisateur, toutes les applications étant livrées. Ils servent de **résultat attendu** pour la recette.

**Administrateur (gérant)** — `gerant`

| Application | Entrées visibles | Barre du bas |
|-------------|------------------|--------------|
| Pilotage | toutes les entrées des sections ouvertes du §9 (6) | Tableau · Zones · Alertes · Approbations · Menu |
| Producteurs et collecte | toutes les entrées des sections ouvertes du §9 (9) | Producteurs · Peser · Pesées · Envois · Menu |
| Dépôts et traitement | toutes les entrées des sections ouvertes du §9 (8) | Entrées · Lots · Traitement · Sorties · Menu |
| Ventes et import-export | toutes les entrées des sections ouvertes du §9 (12) | Clients · Lots · Contrats · Factures · Menu |
| Comptabilité | toutes les entrées des sections ouvertes du §9 (19) | Validation · Décaissement · Journal · Paiements · Menu |
| Ressources humaines | toutes les entrées des sections ouvertes du §9 (12) | Employés · Présences · Congés · Paie du mois · Menu |
| Administration | toutes les entrées des sections ouvertes du §9 (13) | Utilisateurs · Produits · Campagnes · Paramètres · Menu |

**Comptabilité** — `comptable`

| Application | Entrées visibles | Barre du bas |
|-------------|------------------|--------------|
| Comptabilité | **Avances aux producteurs** : Demandes d'avance, Décaissement, Suivi des remboursements, Avances sans livraison ; **Trésorerie** : Caisses et comptes, Journal de caisse et banque, Paiements aux producteurs, Encaissements clients, Transferts de fonds, Clôtures de caisse, Rapprochements bancaires ; **Dépenses** : Dépenses, Règlements, Fournisseurs, Natures de dépense ; **Coûts et résultat** : Coût de revient, Résultat de campagne, Rapports et exports (18) | Décaissement · Journal · Paiements · Dépenses · Menu |

**Superviseur des champs** — `superviseur`

| Application | Entrées visibles | Barre du bas |
|-------------|------------------|--------------|
| Producteurs et collecte | **Producteurs et champs** : Producteurs, Champs, Visites, Carte et zones ; **Collecte** : Nouvelle pesée, Pesées, Reçus de pesée, Envois au dépôt ; **Suivi** : Rapports (9) | Producteurs · Peser · Pesées · Envois · Menu |
| Comptabilité | **Avances aux producteurs** : Demandes d'avance (1) | Demandes |

**Traitement et transformation** — `traitement`

| Application | Entrées visibles | Barre du bas |
|-------------|------------------|--------------|
| Dépôts et traitement | **Réception et lots** : Entrées, Lots au dépôt, Traitement, Valeur avant et après, Sorties ; **Stock** : Stock et mouvements, Inventaires ; **Suivi** : Rapports (8) | Entrées · Lots · Traitement · Sorties · Menu |

**Ventes et marges** — `ventes`

| Application | Entrées visibles | Barre du bas |
|-------------|------------------|--------------|
| Ventes et import-export | **Ventes** : Clients, Lots de vente, Contrats et prix, Factures, Encaissements ; **Coûts et marges** : Coût de revient, Marges ; **Suivi** : Rapports (8) | Clients · Lots · Contrats · Factures · Menu |

**Import-export** — `import-export`

| Application | Entrées visibles | Barre du bas |
|-------------|------------------|--------------|
| Ventes et import-export | **Import-export** : Dossiers d'export, Suivi des expéditions, Dossiers d'import, Documents exigés ; **Suivi** : Rapports (5) | Export · Expéditions · Import · Documents · Rapports |

**Producteur** — `producteur`

| Application | Entrées visibles | Barre du bas |
|-------------|------------------|--------------|
| Mon espace | Mon compte, Mes livraisons, Mes paiements, Mes avances, Mes champs (5) | Compte · Livraisons · Paiements · Avances · Champs |

---

## 11. Icônes

Jeu **Lucide** 1.75.0, licence ISC. Tracé de 1,75 px, 18 px dans le menu, 20 px dans le menu réduit, 22 px dans la barre du bas.

### 11.1 Une notion, une icône

Ces icônes reviennent dans plusieurs applications, toujours pour la même notion.

| Icône | Notion | Entrées |
|-------|--------|---------|
| `hand-coins` | avance | Demandes d'avance (Comptabilité) ; Avances sur salaire (Ressources humaines) ; Mes avances (Mon espace) |
| `calculator` | calcul | Coût de revient (Ventes et import-export) ; Coût de revient (Comptabilité) ; Paie du mois (Ressources humaines) |
| `sprout` | champ | Champs (Producteurs et collecte) ; Mes champs (Mon espace) |
| `stamp` | décision | Approbations (Pilotage) ; Validation (Comptabilité) |
| `coins` | encaissement | Encaissements (Ventes et import-export) ; Encaissements clients (Comptabilité) |
| `scale` | pesée | Pesées (Producteurs et collecte) ; Mes livraisons (Mon espace) |
| `users` | producteurs | Producteurs (Producteurs et collecte) ; Paiements aux producteurs (Comptabilité) |
| `wheat` | produit | Comptes par produit (Comptabilité) ; Produits et règles (Administration) |
| `file-chart-column` | rapports | Rapports (Pilotage) ; Rapports (Producteurs et collecte) ; Rapports (Dépôts et traitement) ; Rapports (Ventes et import-export) ; Rapports et exports (Comptabilité) ; Rapports (Ressources humaines) |
| `sliders-horizontal` | réglages | Rubriques et barème (Ressources humaines) ; Paramètres et seuils (Administration) |
| `banknote` | sortie d'argent | Décaissement (Comptabilité) ; Paiement des salaires (Ressources humaines) ; Mes paiements (Mon espace) |
| `map` | zones | Collecte par zone (Pilotage) ; Zones (Administration) |

### 11.2 Registre complet

Les 98 clés de `icons.ts` : icônes des applications, des sections, des entrées et de la coquille.

| Clé | Utilisée pour |
|-----|---------------|
| `arrow-left-right` | Transferts de fonds (Comptabilité) |
| `badge-percent` | Marges (Ventes et import-export) |
| `banknote` | Décaissement (Comptabilité) ; section Paie (Ressources humaines) ; Paiement des salaires (Ressources humaines) ; Mes paiements (Mon espace) |
| `bell` | Alertes (Pilotage) ; coquille |
| `book-open` | Journal de caisse et banque (Comptabilité) |
| `book-text` | Grand livre (Comptabilité) |
| `book-user` | Balance des tiers (Comptabilité) |
| `boxes` | section Stock (Dépôts et traitement) ; Stock et mouvements (Dépôts et traitement) |
| `briefcase` | application Ressources humaines |
| `building` | Société (Administration) |
| `building-2` | Clients (Ventes et import-export) |
| `calculator` | section Coûts et marges (Ventes et import-export) ; Coût de revient (Ventes et import-export) ; Coût de revient (Comptabilité) ; Paie du mois (Ressources humaines) |
| `calendar-check` | section Temps de travail (Ressources humaines) ; Présences (Ressources humaines) |
| `calendar-clock` | section Clôtures et états (Comptabilité) ; Exercices et périodes (Comptabilité) |
| `calendar-range` | Campagnes (Administration) |
| `chart-column` | section Coûts et résultat (Comptabilité) ; Résultat de campagne (Comptabilité) |
| `check-check` | Rapprochements bancaires (Comptabilité) |
| `chevron-down` | coquille |
| `chevron-right` | coquille |
| `circle-dollar-sign` | Devises et taux de change (Administration) |
| `circle-plus` | Nouvelle pesée (Producteurs et collecte) |
| `circle-user` | application Mon espace |
| `clipboard-check` | Inventaires (Dépôts et traitement) |
| `clipboard-list` | Visites (Producteurs et collecte) |
| `coins` | Encaissements (Ventes et import-export) ; Encaissements clients (Comptabilité) |
| `contact` | Tiers (Comptabilité) |
| `container` | Suivi des expéditions (Ventes et import-export) |
| `credit-card` | Règlements (Comptabilité) |
| `database` | section Référentiels (Administration) |
| `ellipsis` | coquille |
| `file-chart-column` | section Suivi (Pilotage) ; Rapports (Pilotage) ; section Suivi (Producteurs et collecte) ; Rapports (Producteurs et collecte) ; et 7 autres |
| `file-check` | Documents émis (Administration) |
| `file-spreadsheet` | États financiers (Comptabilité) |
| `file-text` | Factures (Ventes et import-export) |
| `file-user` | Bulletins (Ressources humaines) |
| `gauge` | application Pilotage |
| `globe` | application Ventes et import-export |
| `hand-coins` | section Avances aux producteurs (Comptabilité) ; Demandes d'avance (Comptabilité) ; Avances sur salaire (Ressources humaines) ; Mes avances (Mon espace) |
| `handshake` | section Ventes (Ventes et import-export) ; Contrats et prix (Ventes et import-export) |
| `hash` | Numérotation (Administration) |
| `history` | section Traçabilité (Administration) ; Journal d'audit (Administration) |
| `hourglass` | Avances sans livraison (Comptabilité) |
| `id-card` | section Personnel (Ressources humaines) ; Employés (Ressources humaines) |
| `inbox` | section À traiter (Pilotage) |
| `key-round` | section Accès (Administration) ; Rôles et droits (Administration) |
| `landmark` | application Comptabilité |
| `layers` | section Réception et lots (Dépôts et traitement) ; Lots au dépôt (Dépôts et traitement) |
| `layout-dashboard` | Tableau de bord (Pilotage) |
| `layout-grid` | coquille |
| `leaf` | application Producteurs et collecte |
| `library` | Journaux (Comptabilité) |
| `link` | Lettrage (Comptabilité) |
| `list-checks` | Documents exigés (Ventes et import-export) |
| `list-tree` | Plan de comptes (Comptabilité) |
| `lock` | Clôtures de caisse (Comptabilité) |
| `log-in` | Connexions (Administration) |
| `log-out` | coquille |
| `map` | Collecte par zone (Pilotage) ; Zones (Administration) |
| `map-pin` | Carte et zones (Producteurs et collecte) |
| `menu` | coquille |
| `network` | Services et postes (Ressources humaines) |
| `notebook-pen` | section Comptabilité générale (Comptabilité) ; Écritures (Comptabilité) |
| `package-check` | Lots de vente (Ventes et import-export) |
| `package-minus` | Sorties (Dépôts et traitement) |
| `package-open` | Dossiers d'import (Ventes et import-export) |
| `package-plus` | Entrées (Dépôts et traitement) |
| `panel-left-close` | coquille |
| `panel-left-open` | coquille |
| `percent` | Taxes (Comptabilité) |
| `receipt` | Reçus de pesée (Producteurs et collecte) |
| `receipt-text` | section Dépenses (Comptabilité) ; Dépenses (Comptabilité) |
| `repeat` | Suivi des remboursements (Comptabilité) |
| `route` | Missions (Ressources humaines) |
| `scale` | section Collecte (Producteurs et collecte) ; Pesées (Producteurs et collecte) ; Mes livraisons (Mon espace) |
| `scroll-text` | Contrats (Ressources humaines) |
| `search` | coquille |
| `settings` | application Administration |
| `ship` | section Import-export (Ventes et import-export) ; Dossiers d'export (Ventes et import-export) |
| `sigma` | Balance générale (Comptabilité) |
| `sliders-horizontal` | section Paramétrage comptable (Comptabilité) ; Rubriques et barème (Ressources humaines) ; section Réglages (Administration) ; Paramètres et seuils (Administration) |
| `sprout` | Champs (Producteurs et collecte) ; Mes champs (Mon espace) |
| `stamp` | Approbations (Pilotage) ; Validation (Comptabilité) |
| `store` | Fournisseurs (Comptabilité) |
| `sun` | Traitement (Dépôts et traitement) |
| `tags` | Natures de dépense (Comptabilité) |
| `target` | Objectifs de collecte (Pilotage) |
| `tractor` | Immobilisations (Comptabilité) |
| `tree-palm` | Congés (Ressources humaines) |
| `trending-up` | Valeur avant et après (Dépôts et traitement) |
| `truck` | Envois au dépôt (Producteurs et collecte) |
| `user` | Mon compte (Mon espace) ; coquille |
| `user-cog` | Utilisateurs (Administration) |
| `users` | section Producteurs et champs (Producteurs et collecte) ; Producteurs (Producteurs et collecte) ; Paiements aux producteurs (Comptabilité) |
| `wallet` | section Trésorerie (Comptabilité) ; Caisses et comptes (Comptabilité) |
| `warehouse` | application Dépôts et traitement ; Dépôts (Administration) |
| `wheat` | Comptes par produit (Comptabilité) ; Produits et règles (Administration) |
| `workflow` | Modèles d'écritures (Comptabilité) |
| `x` | coquille |

Pour ajouter une icône : copier le contenu de son fichier SVG Lucide dans `icons.ts` sous son nom, puis vérifier qu'elle ne sert pas déjà une autre notion.

---

## 12. Recette

### 12.1 Pour chaque application

- [ ] Le menu affiche les sections et les entrées du §9, dans le même ordre, avec les mêmes libellés et les mêmes icônes.
- [ ] L'arrivée sur `/<m>` mène à la première entrée permise du rôle.
- [ ] Chaque entrée ouvre son écran ; l'entrée reste active sur les fiches de sa liste.
- [ ] La section de la page courante est ouverte ; les autres se déplient et se replient.
- [ ] Une section repliée affiche le total de ses compteurs.
- [ ] Aucun libellé n'est coupé à 264 px de large ; l'infobulle donne l'aide.
- [ ] Aucun libellé, aucune icône, aucune adresse de menu n'est écrit dans un template.

### 12.2 Pour chaque rôle

Se connecter avec chacun des sept utilisateurs de démonstration.

- [ ] Le portail ne montre que ses applications ; un rôle à une seule application y arrive sans portail.
- [ ] Chaque menu correspond au tableau du §10.2 : mêmes sections, mêmes entrées.
- [ ] Une adresse d'un écran non permis, saisie à la main, ramène au portail.
- [ ] Une adresse d'une section fermée répond « page introuvable ».
- [ ] Sur téléphone, la barre du bas correspond à la colonne « Barre du bas » du §10.2.

### 12.3 Pour l'ensemble

- [ ] Menu réduit : une icône par section, panneau au clic, accès direct pour une section d'une entrée ; l'état est retrouvé après rechargement.
- [ ] Recherche (Comptabilité) : « caisse » donne quatre entrées de Trésorerie ; « tresorerie » donne la section entière ; un mot inconnu donne la phrase « Aucune entrée… ».
- [ ] Clavier : tout le menu se parcourt et s'ouvre sans souris ; le focus est toujours visible ; Échap ferme panneau et tiroir.
- [ ] Lecteur d'écran : l'entrée active est annoncée comme page courante ; un compteur est lu « 3 à traiter ».
- [ ] À 360 px de large : tiroir complet, barre du bas lisible, rien ne déborde.
- [ ] Les compteurs se mettent à jour après une validation, un versement, un paiement, sans recharger la page.
- [ ] `ng build` passe ; le contrôle des imports d'`ARCHITECTURE.md` (§6.5) n'affiche rien.

---

## 13. Points à confirmer

| Sujet | Hypothèse retenue | À confirmer avec |
|-------|-------------------|------------------|
| Droits de chaque rôle | la répartition du §10.1 | le client, à l'atelier de cadrage |
| Validation d'une pesée | par le superviseur qui l'a saisie (`terrain.pesee.valider`) | le client |
| Correction d'une pesée, annulation d'une facture, validation d'un inventaire | réservées au gérant | le client |
| Compteurs | un seul point d'entrée ; conditions du §8.2, dont 10 *à préciser* | l'équipe backend |
| Libellés | ceux du guide des 11 modules, ajustés à 28 caractères | le client |
| Barre du bas | les entrées épinglées du §9 | vous, après un essai sur le terrain |
| Sections fermées | Comptabilité générale, Clôtures et états, Paramétrage comptable ; l'application Ressources humaines | le client (hors de l'offre signée) |
| Icônes | jeu Lucide ; les notions du §11.1 | vous |
