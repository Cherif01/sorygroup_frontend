# Chaîne agricole — **Guide des actions et des formulaires**

> Troisième guide du front, après `ARCHITECTURE.md` (où ranger le code) et `MENUS.md` (comment on y navigue).
> Celui-ci décrit **chaque action de chaque application** : sur quel écran, avec quelle permission, dans quel état de la ligne, avec quels champs, par quelle requête, ce que fait le serveur, ce qu'il peut refuser, et ce que l'écran fait ensuite.
>
> En chiffres : 109 actions sur 123 pages, 478 champs de formulaire, 170 permissions toutes couvertes, 34 colonnes d'état, 52 listes de valeurs, 98 motifs de refus.
> Chaque champ est contrôlé contre le script de la base (102 tables, 1 283 colonnes). Le code du §2 est compilé avec Angular 19.2 en mode strict et exécuté (58 contrôles).

---

## Table des matières

- [0. Mode d'emploi](#0-mode-demploi)
- [1. Le contrat des requêtes](#1-le-contrat-des-requêtes)
- [2. Du type de colonne au champ de formulaire](#2-du-type-de-colonne-au-champ-de-formulaire)
- [3. Lire une fiche d'action](#3-lire-une-fiche-daction)
- [4. Une campagne, action par action](#4-une-campagne-action-par-action)
- [5. Session et gestes communs](#5-session-et-gestes-communs)
- [6. Pilotage](#6-pilotage)
- [7. Producteurs et collecte](#7-producteurs-et-collecte)
- [8. Dépôts et traitement](#8-dépôts-et-traitement)
- [9. Ventes et import-export](#9-ventes-et-import-export)
- [10. Comptabilité](#10-comptabilité)
- [11. Ressources humaines](#11-ressources-humaines)
- [12. Administration](#12-administration)
- [13. Mon espace](#13-mon-espace)
- [14. États et pastilles](#14-états-et-pastilles)
- [15. Listes de valeurs](#15-listes-de-valeurs)
- [16. Motifs de refus](#16-motifs-de-refus)
- [17. Compteurs des menus](#17-compteurs-des-menus)
- [18. Des permissions aux actions](#18-des-permissions-aux-actions)
- [19. Points à confirmer](#19-points-à-confirmer)

---

## 0. Mode d'emploi

**Pour qui.** Le développeur du front (ou Claude) qui prépare un écran, et celui de l'API PHP qui doit lui répondre : les deux lisent la même fiche.

**Comment s'en servir.**

1. Lire une fois les §1 à §3 : le contrat des requêtes, la correspondance entre une colonne et un champ, la lecture d'une fiche.
2. Avant d'écrire une page, ouvrir le chapitre de son application (§5 à §13) : la page y a sa requête de lecture, puis une fiche par action.
3. Garder ouvertes les annexes : états et pastilles (§14), listes de valeurs (§15), motifs de refus (§16).
4. Avec Claude : lui donner les §0 à §3 et **le seul chapitre de l'application en cours**, pas le guide entier. L'archive `formulaires-chaine-agricole.zip` contient le guide découpé, un fichier par application.

**Ce qui est sûr, ce qui est proposé.**

| Sûr : lu dans les documents du projet et contrôlé par script | Proposé : à caler avec l'API avant de coder |
|---|---|
| Le nom de chaque colonne, son type, son caractère obligatoire, les valeurs de chaque liste : script de la base | L'adresse exacte de chaque requête (§1.1) et les requêtes de préparation (§1.9) |
| Les permissions et les routes : `config.ts`, `<m>.routes.ts`, `<m>.menu.ts` des deux autres guides | Le nom des motifs de refus (§16) |
| Les tables écrites par les grandes étapes (avance, pesée, entrée, traitement, vente, encaissement) : scénario d'essai de la base | Quelques règles de gestion que la base ne tranche pas, listées au §19 |
| Les chiffres de Sékou Camara dans les exemples : `chaine.util.ts` et le scénario d'essai | Les valeurs d'exemple signalées « d'illustration » |

**Trois règles qui valent pour toutes les fiches.**

- **Le serveur fait foi.** Le front masque un bouton interdit et calcule des aperçus ; c'est l'API qui refuse et qui calcule.
- **Une clé envoyée = une colonne de la base**, au même nom. Aucune traduction, dans aucun sens.
- **Une action = une requête = une transaction.** Si elle échoue, rien n'est enregistré et la saisie reste à l'écran.

---

## 1. Le contrat des requêtes

L'API suit les tables, pas les applications du front. Une ressource porte le nom de sa table, avec des tirets : `avance_versements` devient `avance-versements`.

### 1.1 Les six formes d'adresse

| Besoin | Forme | Exemple |
|--------|-------|---------|
| Lire une liste | `GET <ressource>` | `GET pesees?statut=validee&page=2` |
| Lire une fiche | `GET <ressource>/{id}` | `GET avances/1` |
| Préparer un formulaire | `GET <ressource>/preparation` | `GET avances/preparation?producteur_id=1` |
| Créer | `POST <ressource>` | `POST pesees` |
| Modifier une ligne pas encore validée | `PUT <ressource>/{id}` | `PUT pesees/1` |
| Agir sur une ligne | `POST <ressource>/{id}/<verbe>` | `POST pesees/1/valider` |

- Le verbe est à l'infinitif : `valider`, `verser`, `payer`, `annuler`, `refuser`, `desactiver`.
- Une action qui **crée une ligne fille** se poste sur la mère : verser une avance est `POST avances/{id}/verser`, et son corps porte les colonnes de `avance_versements`.
- Une **valeur datée** s'ajoute sous sa mère, par son nom : `POST produits/{id}/prix`, `POST parametres/{id}/valeurs`. L'ancienne valeur est fermée par le serveur, jamais modifiée.
- **Pas de `DELETE`.** Rien ne s'efface : une fiche se désactive, une opération s'annule par une action. Les lignes d'un document en préparation (sacs d'une pesée, lignes d'une facture, lots d'un lot de vente) partent **avec leur document**, dans un tableau qui remplace la liste entière.
- En-têtes de toute requête : `Authorization: Bearer <jeton>`, `Accept: application/json`, et `Content-Type: application/json` s'il y a un corps. C'est `core/interceptors/auth.interceptor.ts` qui les pose.

### 1.2 Lire une liste

| Paramètre | Rôle | Exemple |
|-----------|------|---------|
| `page`, `par_page` | pagination par le serveur ; 25 lignes par défaut, 100 au plus | `page=2&par_page=25` |
| `tri` | colonne de tri, précédée de `-` pour décroissant | `tri=-date_pesee` |
| `recherche` | texte libre ; chaque page dit sur quoi il porte | `recherche=camara` |
| `du`, `au` | période, sur la date principale de la table | `du=2026-03-01&au=2026-03-31` |
| nom d'une colonne | filtre exact ; plusieurs valeurs séparées par une virgule | `statut=emise,payee_partiel` |
| `campagne_id`, `produit_id` | contexte de la barre supérieure, joint par `contexte.params()` | `campagne_id=1&produit_id=1` |

Le périmètre (zone du superviseur, dépôt du responsable) n'est **jamais** un paramètre : le serveur l'applique seul.

```json
{
  "data": [
    { "id": 1, "numero": "PE-2026-000001", "date_pesee": "2026-03-18 09:30:00",
      "producteur_id": 1, "producteur": { "id": 1, "code": "PR-000001", "libelle": "CAMARA Sékou" },
      "poids_net_kg": "420.000", "net_a_payer": "1512000.00", "statut": "validee" }
  ],
  "total": 4, "page": 1, "par_page": 25,
  "totaux": { "poids_net_kg": "1500.000", "net_a_payer": "7000000.00" }
}
```

- `total` compte toutes les lignes du filtre, pas seulement celles de la page.
- `totaux` n'existe que pour les listes à ligne de total ; il porte sur **tout le filtre**. Le front n'additionne jamais les lignes d'une page.
- Chaque clé étrangère arrive avec sa **référence** : `producteur_id` est accompagné de `producteur` (`id`, `code`, `libelle` prêt à afficher). Une liste s'affiche sans seconde requête. Le type `AvecRefs<T>` du §2.3 le décrit une fois pour toutes.

### 1.3 Lire une fiche

`GET <ressource>/{id}` renvoie la ligne, ses références, et **ses lignes filles** sous le nom de leur table ou le nom donné par la page (`sacs`, `lignes`, `compositions`, `perimetres`). Les blocs communs se lisent à part : pièces jointes (SE-07), historique (SE-08), documents (SE-09).

Une fiche ne renvoie pas la liste des boutons à afficher : le front la déduit de **l'état de la ligne** et des **permissions** de l'utilisateur, comme l'indique chaque fiche d'action.

### 1.4 Créer, modifier, agir

- Le corps ne contient que **ce que l'utilisateur saisit** (tableau « Formulaire » de la fiche), plus le contexte que l'écran connaît déjà (`campagne_id`).
- `PUT` renvoie le formulaire **entier**, pas seulement ce qui a changé.
- Réponse en cas de succès : `201` pour une création, `200` sinon, avec **la ligne complète telle que la fiche la lirait**. L'écran se met à jour avec cette réponse, sans relire.
- Une clé que le serveur remplit lui-même est ignorée si elle est envoyée ; elle ne provoque pas d'erreur, mais le front ne l'envoie pas.

### 1.5 Le format des valeurs

| Type de la colonne | Dans le JSON, à l'aller comme au retour | Exemple |
|--------------------|------------------------------------------|---------|
| `DECIMAL` (montant, poids, pourcentage, taux, prix) | **chaîne**, avec toutes ses décimales et un point | `"2000000.00"` · `"420.000"` · `"8700.000000"` |
| `DATE` | chaîne année-mois-jour | `"2026-03-18"` |
| `DATETIME` | chaîne, heure de Conakry (heure universelle, sans décalage) | `"2026-03-18 09:30:00"` |
| `TINYINT(1)` | booléen | `true`, `false` |
| `ENUM` | la valeur de la base, jamais son libellé | `"orange_money"` |
| entier, clé étrangère | nombre | `17` |
| champ laissé vide | `null`, jamais une chaîne vide | `null` |
| `JSON` | objet | un polygone GeoJSON |

Un montant voyage toujours avec deux décimales, même en GNF : c'est l'affichage qui masque les centimes (`devises.nombre_decimales`).

### 1.6 Ce que le front n'envoie jamais

Chaque fiche liste ces colonnes sous « Rempli par le serveur ». Elles appartiennent toutes à l'une de ces familles :

| Famille | Exemples | Pourquoi |
|---------|----------|----------|
| Identifiant et numéro | `id`, `numero`, `code` d'une opération ou d'une fiche | attribués dans la transaction (table `compteurs`) : pas de trou, pas de doublon |
| Auteur | `demande_par`, `validee_par`, `verse_par`, `superviseur_id` | c'est l'utilisateur de la session : on ne signe pas pour un autre |
| État | `statut`, `decision`, `est_annule`, `est_complet`, `est_hors_seuil` | il ne change que par une action |
| Copie figée | `prix_kg`, `taux_retenue_pct`, `plafond`, `taux_change` d'une vente | valeur en vigueur à la date de l'opération, lue par le serveur |
| Calcul | `poids_net_kg`, `montant_brut`, `net_a_payer`, `ecart_kg`, `perte_pct`, les totaux | recalculé en `DECIMAL` côté serveur |
| Cache | `montant_paye`, `montant_rembourse`, `solde`, `poids_actuel_kg`, `cout_revient` | somme tenue à jour par les actions |
| Technique | `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` | posées par la base |

### 1.7 Réponses et refus

| Code HTTP | Sens | Ce que fait l'écran |
|-----------|------|---------------------|
| `200`, `201` | réussite | met à jour avec la réponse, ferme le dialogue, message court, compteurs rafraîchis |
| `401` | session absente ou expirée | l'intercepteur ouvre `default-session-expired`, puis `/auth` |
| `403` | permission manquante, ligne hors du périmètre, ou même personne pour demander et décider | `default-error` avec le message ; rien n'est retenté |
| `404` | ligne inconnue ou hors du périmètre | retour à la liste avec un message |
| `409` | **refus de gestion** : la règle est dans `code` (§16) | bandeau rouge **dans** le formulaire, qui reste ouvert avec sa saisie |
| `422` | saisie incorrecte : `erreurs` nomme les champs | message sous chaque champ (`appliquerErreurs`, §2.3) |
| `413`, `415` | fichier trop lourd, ou d'un type refusé | message sous le champ du fichier |
| `429` | trop de tentatives de connexion | message, bouton désactivé un moment |
| `5xx`, ou pas de réponse | panne ou réseau coupé | bandeau « Réessayer » ; le bouton redevient actif, la saisie est gardée |

Toute réponse d'erreur a le même corps (`ApiErreur`, §2.3) :

```json
{ "code": "VALIDATION", "message": "La saisie contient des erreurs.",
  "erreurs": { "montant_demande": ["Le montant doit être supérieur à 0."], "sacs.0.numero_sac": ["Ce numéro figure deux fois."] } }
```

```json
{ "code": "SOLDE_INSUFFISANT", "message": "La caisse principale n'a que 1 250 000 GNF.",
  "details": { "solde": "1250000.00" } }
```

- `message` est une phrase complète en français, prête à afficher : le front ne fabrique pas de message à partir de `code`.
- `erreurs` a pour clés celles du corps envoyé ; une ligne de tableau s'écrit avec son rang (`sacs.0.numero_sac`).
- `details` porte les chiffres qui permettent à l'écran d'en dire plus (plafond, solde, pièces manquantes).
- Un motif vaut partout : **`ETAT_INCOMPATIBLE`** (`409`). La ligne n'est plus dans l'état que l'action attend, parce que quelqu'un a agi entre-temps. L'écran recharge la fiche et le dit : « Cette ligne a déjà été traitée. »

### 1.8 Un paiement ne part pas deux fois

Cinq tables enregistrent une sortie ou une entrée d'argent saisie à l'écran, et toutes exigent une `reference_unique` : `avance_versements`, `paiements_producteurs`, `paiements_depenses`, `encaissements`, `paiements_salaires`. Deux autres l'acceptent : `avances_salaire` et `mouvements_tresorerie`.

1. Le navigateur crée la référence (`nouvelleReferenceUnique()`, un UUID) **à l'ouverture du formulaire**, une seule fois.
2. Tout nouvel envoi du même formulaire — après une coupure, un délai dépassé, un refus corrigé — porte **la même référence**.
3. Le serveur qui reçoit une référence déjà enregistrée ne paie pas une seconde fois : il répond `200` avec le paiement déjà fait.
4. Payer une autre ligne ouvre un autre formulaire, donc une autre référence.

Le composant `shared/metier/paiement-form/` (§2.5) applique ces quatre points pour tous les écrans.

### 1.9 Préparer un formulaire

Un formulaire qui affiche un prix, un taux, un plafond ou un reste dû **ne les calcule pas et ne les lit pas dans les référentiels** : il les demande au serveur, qui connaît la valeur en vigueur à la date voulue. Une seule requête par formulaire, relancée quand son paramètre change.

| Formulaire | Requête de préparation | Ce qu'elle renvoie |
|---|---|---|
| TE-05 Enregistrer une pesée | `GET pesees/preparation?producteur_id=1&champ_id=1&date_pesee=2026-03-18` | `prix_kg`, `taux_retenue_pct`, `humidite_max_achat`, `reste_du_avances`, `poids_sac_kg` à cette date |
| DE-01 Recevoir un bordereau | `GET entrees-depot/preparation?bordereau_id=1` | poids annoncé, nombre de sacs, `seuil_ecart_pct` en vigueur (paramètre `ECART_POIDS_SEUIL_PCT`) |
| DE-05 Terminer une étape de traitement | `GET regles-en-vigueur?produit_id=1` | `perte_norme_min`, `perte_norme_max`, `perte_seuil_blocage`, `humidite_vente` |
| VE-04 Préparer un contrat de vente | `GET ventes/preparation?lot_vente_id=1&devise_id=2&date_vente=2026-06-20` | poids du lot, `cout_revient`, `taux_change` et `date_taux` du jour |
| VE-06 Préparer une facture | `GET factures/preparation?vente_id=1` | lignes proposées à partir du contrat, devise et taux du contrat |
| CO-01 Demander une avance | `GET avances/preparation?producteur_id=1&campagne_id=1` | `estimation_kg`, `prix_kg_reference`, `part_plafond_pct`, `plafond`, `reste_du_precedent` |
| CO-09 Encaisser une facture | `GET encaissements/preparation?facture_id=1&date_encaissement=2026-07-05` | `reste_a_encaisser` en devise, taux de la facture, taux du jour |
| CO-13 Clôturer une caisse | `GET clotures-caisse/preparation?compte_tresorerie_id=1&date_cloture=2026-03-18` | `solde_theorique` et mouvements du jour |

Les listes des sélecteurs se lisent par les requêtes de liste ordinaires, citées dans chaque fiche à la ligne « Avant la saisie ». Les référentiels courts (produits, zones, dépôts, devises) sont chargés une fois par `shared/services/references/`.

### 1.10 Fichiers et documents

Un fichier (photo, reçu signé, justificatif, scan) ne voyage jamais dans le corps d'une action : la ligne est créée d'abord, le fichier y est joint ensuite par SE-07. Les PDF officiels sont produits par le serveur au moment de l'action et se lisent par SE-09.

---

## 2. Du type de colonne au champ de formulaire

### 2.1 La correspondance

La colonne « Saisie » de chaque fiche vient de ce tableau, appliqué au type de la colonne dans la base.

| Colonne de la base | « Saisie » dans une fiche | Dans le HTML | Valeur envoyée | Colonnes concernées |
|---|---|---|---|---|
| `VARCHAR(n)` | texte | `<input maxlength="n">` ; `type="tel"` pour un téléphone, `type="email"` pour un courriel | chaîne sans espace autour | 202 |
| `TEXT` | texte long | `<textarea>` | chaîne | 3 |
| `DATE` | date | `<input type="date">` | `"2026-03-18"` | 75 |
| `DATETIME` | date et heure | `<input type="datetime-local">`, secondes ajoutées à l'envoi | `"2026-03-18 09:30:00"` | 18 |
| `DECIMAL(18,2)` | montant | `appDecimal="2"`, devise en suffixe | `"2000000.00"` | 84 |
| `DECIMAL(12,3)` | poids en kg | `appDecimal="3"`, `kg` en suffixe | `"420.000"` | 32 |
| `DECIMAL(5,2)` d'un taux | pourcentage | `appDecimal="2"`, `%` en suffixe, de 0 à 100 | `"14.00"` | 21 |
| `DECIMAL(18,6)` | taux de change | `appDecimal="6"` | `"8700.000000"` | 7 |
| `DECIMAL(18,4)` | prix (4 déc.) | `appDecimal="4"`, devise et unité en suffixe | `"1350.0000"` | 2 |
| `DECIMAL(10,7)` | coordonnée GPS | `appDecimal="7"`, ou le bouton « Ma position » | `"10.7654321"` | 6 |
| autres `DECIMAL` | nombre (n déc.) | `appDecimal="n"` | chaîne à `n` décimales | 10 |
| `INT`, `SMALLINT`, `TINYINT` | entier | `<input type="number" step="1" inputmode="numeric">` | nombre | 40 |
| `TINYINT(1)` | case à cocher | `<input type="checkbox">` | `true` ou `false` | 34 |
| `ENUM` | liste | boutons radio ou `<select>`, options de `LISTES` | la valeur de la base | 86 |
| clé étrangère | sélecteur → `table` | `shared/metier/selecteurs/` ou `<select>` d'un référentiel | l'identifiant | 250 |
| `CHAR(n)` | texte fixe (n) | `reference_unique` : aucun champ, `nouvelleReferenceUnique()` ; code d'une devise : 3 lettres | un UUID ; `"USD"` | 10 |
| `JSON` | JSON | produit par un composant (contour d'un champ) | un objet | 3 |
| | | | **Total, hors colonnes techniques** | **883** |

- **Obligatoire** : la colonne « Oblig. » d'une fiche vaut « oui » quand la colonne de la base est `NOT NULL` sans valeur par défaut, ou quand la règle de gestion l'exige.
- **Liste ou boutons radio** : jusqu'à quatre valeurs, des boutons radio ; au-delà, une liste déroulante. Les options et leurs libellés sont dans `shared/models/listes.ts` (§15).
- **Sélecteur** : recherche au clavier pour une table longue (producteurs, clients, fournisseurs, lots) ; liste déroulante pour un référentiel court.
- Les quatre composants de `shared/ui/champs/` (poids, montant, pourcentage, date) habillent ces champs : libellé, unité en suffixe, message d'erreur. Leur valeur reste celle du tableau.

### 2.2 Douze règles pour tous les formulaires

1. **Les clés du `FormGroup` sont les noms des colonnes.** Le corps de la requête est `form.getRawValue()`, complété du contexte.
2. **Formulaires réactifs typés**, signaux pour l'état de l'écran (`envoiEnCours`, `bandeau`, `preparation`). Pas de `ngModel`.
3. **Un nombre décimal est une chaîne** du champ jusqu'à l'API (`appDecimal`, §2.3). Aucun `parseFloat` sur un montant.
4. **Valeurs par défaut utiles** : date du jour, campagne de la barre supérieure, zone ou dépôt de l'utilisateur quand il n'en a qu'un (champ verrouillé).
5. **Validation à la sortie du champ**, message précis sous le champ : « Le téléphone doit contenir 9 chiffres après +224 », pas « Champ invalide ».
6. **L'aperçu n'est pas le résultat.** Pendant la saisie, `chaine.util.ts` calcule un aperçu ; après l'envoi, l'écran affiche les chiffres de la réponse.
7. **Bouton principal à droite, désactivé pendant l'envoi.** Un double clic n'envoie qu'une requête.
8. **Un refus garde tout** : dialogue ouvert, saisie intacte, message du serveur affiché.
9. **Quitter un formulaire modifié demande confirmation** (`default-confirm`), y compris au changement de campagne.
10. **Jusqu'à huit champs, un dialogue ; au-delà, une page.** La fiche indique la forme retenue.
11. **Sur téléphone, une seule colonne**, clavier adapté (`inputmode="decimal"`, `type="tel"`), zones tactiles de 44 px.
12. **Après le succès** : fermer, notifier d'une phrase, mettre à jour la liste et les compteurs cités à la ligne « Ensuite ».

Tant que l'API n'existe pas (`environment.useMocks`), les services lisent `shared/data/` et renvoient ces mêmes formes de réponse : les écrans ne changent pas le jour où l'API arrive.

### 2.3 Les fichiers communs

Les types de l'API. Le fichier remplace celui du §15.3 d'`ARCHITECTURE.md`, qu'il complète.

```ts
// shared/models/api.model.ts
/** Un DECIMAL de la base voyage en chaîne (« 420.000 ») pour ne rien perdre. */
export type Decimal = string;

/** Réponse d'une liste paginée par le serveur. */
export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  par_page: number;
  totaux?: Record<string, Decimal>;        // ligne de total, quand la liste en a une
}

/** Ce qui accompagne une clé étrangère pour l'afficher : `producteur_id` arrive avec `producteur`. */
export interface Ref {
  id: number;
  code?: string;                           // PR-000001, KOL-2026-012…
  libelle: string;                         // prêt à afficher : « CAMARA Sékou »
}

/** Ajoute à un modèle la référence de chacune de ses clés `…_id` : `producteur_id` donne `producteur?: Ref`. */
export type AvecRefs<T> = T & { [K in keyof T as K extends `${infer Nom}_id` ? Nom : never]?: Ref };

/** Corps de toute réponse d'erreur (4xx). */
export interface ApiErreur {
  code: string;                            // 'VALIDATION', ou la raison du refus : 'SOLDE_INSUFFISANT'…
  message: string;                         // phrase prête à afficher
  erreurs?: Record<string, string[]>;      // 422 : messages par clé du corps envoyé (« sacs.0.numero_sac »)
  details?: Record<string, unknown>;       // chiffres utiles au message : plafond, solde, pièces manquantes
}
```

Conversions, dates et erreurs du serveur :

```ts
// shared/utils/formulaire.util.ts
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ApiErreur, Decimal } from '../models/api.model';

/**
 * Saisie → DECIMAL de l'API : « 1 496,5 » avec 3 décimales donne '1496.500'.
 * null si le champ est vide, n'est pas un nombre, ou porte trop de décimales.
 */
export function versDecimal(saisie: string | number | null | undefined, decimales: number): Decimal | null {
  if (saisie === null || saisie === undefined) return null;
  const texte = String(saisie).replace(/[\s  ]/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d*)?$/.test(texte)) return null;
  const [entier, fraction = ''] = texte.split('.');
  if (fraction.length > decimales) return null;
  const propre = entier.replace(/^(-?)0+(?=\d)/, '$1');
  return decimales === 0 ? propre : `${propre}.${fraction.padEnd(decimales, '0')}`;
}

/** DECIMAL de l'API → texte d'un champ : '2000000.00' donne « 2 000 000 », '1496.500' donne « 1 496,5 ». */
export function versSaisie(valeur: Decimal | null | undefined): string {
  if (valeur === null || valeur === undefined || valeur === '') return '';
  const [entier, fraction = ''] = valeur.split('.');
  const groupes = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const reste = fraction.replace(/0+$/, '');
  return reste ? `${groupes},${reste}` : groupes;
}

/** Date et heure au format de l'API. Conakry est à l'heure universelle toute l'année : aucun décalage à gérer. */
export const aujourdhui = (): string => new Date().toISOString().slice(0, 10);
export const maintenant = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

/** Erreur HTTP → ApiErreur, même quand le serveur n'a rien répondu. */
export function lireErreur(err: unknown): ApiErreur {
  if (!(err instanceof HttpErrorResponse)) return { code: 'ERREUR', message: 'Une erreur est survenue.' };
  if (err.status === 0) return { code: 'HORS_LIGNE', message: 'Pas de réseau. Rien n’est perdu : réessayez dès que la connexion revient.' };
  const corps = err.error as Partial<ApiErreur> | null;
  if (corps && typeof corps.code === 'string') {
    return { code: corps.code, message: corps.message ?? '', erreurs: corps.erreurs, details: corps.details };
  }
  return { code: `ERREUR_${err.status}`, message: 'Le serveur a refusé la demande.' };
}

/**
 * Pose les messages du serveur sur les champs du formulaire (erreur « serveur »).
 * Renvoie le message à afficher en bandeau au-dessus du formulaire, ou null si tout est porté par les champs.
 */
export function appliquerErreurs(form: FormGroup, erreur: ApiErreur): string | null {
  let surChamps = false;
  for (const [cle, messages] of Object.entries(erreur.erreurs ?? {})) {
    const champ = form.get(cle);                       // « montant_demande », « sacs.0.numero_sac »
    if (!champ) continue;
    champ.setErrors({ ...(champ.errors ?? {}), serveur: messages[0] });
    champ.markAsTouched();
    surChamps = true;
  }
  return erreur.code === 'VALIDATION' && surChamps ? null : erreur.message;
}

/** Message à écrire sous un champ : celui du serveur d'abord, sinon celui de la règle locale. */
export function messageDe(champ: AbstractControl | null, libelles: Record<string, string> = {}): string | null {
  if (!champ || !champ.errors || !champ.touched) return null;
  const erreurs = champ.errors;
  if (typeof erreurs['serveur'] === 'string') return erreurs['serveur'];
  if (erreurs['required']) return libelles['required'] ?? 'Ce champ est obligatoire.';
  return libelles[Object.keys(erreurs)[0]] ?? 'Valeur incorrecte.';
}
```

Le champ numérique : sa valeur est le `DECIMAL` de l'API, son affichage est français.

```ts
// shared/ui/champs/decimal.directive.ts
import { Directive, ElementRef, HostListener, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Decimal } from '../../models/api.model';
import { versDecimal, versSaisie } from '../../utils/formulaire.util';

/**
 * Champ numérique dont la valeur est un DECIMAL de l'API (chaîne), jamais un nombre JavaScript.
 * <input appDecimal="3" formControlName="poids_brut_kg" inputmode="decimal" />
 * Un montant voyage toujours avec 2 décimales, même en GNF : c'est l'affichage qui masque les centimes.
 */
@Directive({
  selector: 'input[appDecimal]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DecimalDirective), multi: true }],
})
export class DecimalDirective implements ControlValueAccessor {
  /** Décimales envoyées : 2 montant ou pourcentage, 3 poids, 4 prix de vente, 6 taux de change. */
  readonly decimales = input(2, { alias: 'appDecimal', transform: (v: number | string) => (v === '' ? 2 : Number(v)) });

  private readonly champ = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private onChange: (valeur: Decimal | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(valeur: Decimal | null): void {
    this.champ.value = versSaisie(valeur);
  }

  registerOnChange(fn: (valeur: Decimal | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(inactif: boolean): void {
    this.champ.disabled = inactif;
  }

  @HostListener('input')
  saisir(): void {
    this.onChange(versDecimal(this.champ.value, this.decimales()));
  }

  /** À la sortie du champ, « 2000000 » devient « 2 000 000 ». */
  @HostListener('blur')
  quitter(): void {
    this.onTouched();
    const valeur = versDecimal(this.champ.value, this.decimales());
    if (valeur !== null) this.champ.value = versSaisie(valeur);
  }
}
```

Trois fichiers générés depuis le script de la base accompagnent ce guide (archive `formulaires-chaine-agricole.zip`) :

| Fichier | Contenu |
|---------|---------|
| `shared/models/statuts.ts` | les 34 colonnes d'état, valeur par valeur, avec libellé et ton de pastille (§14). Il remplace celui du §8.9 d'`ARCHITECTURE.md`, dont il garde les neuf tables à l'identique |
| `shared/models/listes.ts` | les 52 listes de valeurs et `libelleDe()` (§15) |
| `<module>/shared/models/*.model.ts` | une interface par table, 102 en tout : propriétés = colonnes, types de ce tableau |

### 2.4 Formulaire de référence, en page : demander une avance

Il montre tout ce qu'un formulaire de l'application doit savoir faire : arrivée avec un paramètre, requête de préparation, aperçu, blocage annoncé avant l'envoi, envoi, erreurs par champ, refus en bandeau, suite. C'est la fiche CO-01.

```ts
// comptabilite/pages/avances/demande-saisie/demande-saisie.component.ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, filter, of, startWith, switchMap } from 'rxjs';
import { ContexteService } from '../../../../core/services/contexte.service';
import { SelecteurProducteurComponent } from '../../../../shared/metier/selecteurs/selecteur-producteur.component';
import { Decimal } from '../../../../shared/models/api.model';
import { MontantPipe } from '../../../../shared/pipes/montant.pipe';
import { PctPipe } from '../../../../shared/pipes/pct.pipe';
import { PoidsPipe } from '../../../../shared/pipes/poids.pipe';
import { DecimalDirective } from '../../../../shared/ui/champs/decimal.directive';
import { toCentimes } from '../../../../shared/utils/chaine.util';
import { appliquerErreurs, aujourdhui, lireErreur, messageDe } from '../../../../shared/utils/formulaire.util';
import { AvanceDemande, AvancePreparation } from '../../../shared/models/avance.model';
import { AvancesService } from '../../../shared/services/avances.service';

/** CO-01 · Demander une avance. Formulaire de référence : préparation, aperçu, envoi, refus. */
@Component({
  selector: 'app-co-avances-demande-saisie',
  imports: [ReactiveFormsModule, RouterLink, DecimalDirective, SelecteurProducteurComponent, MontantPipe, PoidsPipe, PctPipe],
  templateUrl: './demande-saisie.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoAvancesDemandeSaisieComponent {
  private readonly avances = inject(AvancesService);
  private readonly contexte = inject(ContexteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Une clé par colonne saisie, au nom de la colonne. `campagne_id` vient du contexte, pas du formulaire. */
  readonly form = new FormGroup({
    producteur_id: new FormControl<number | null>(null, Validators.required),
    date_demande: new FormControl(aujourdhui(), { nonNullable: true, validators: Validators.required }),
    montant_demande: new FormControl<Decimal | null>(null, Validators.required),
    motif: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    objectif_kg: new FormControl<Decimal | null>(null, Validators.required),
  });

  readonly preparation = signal<AvancePreparation | null>(null);
  readonly envoiEnCours = signal(false);
  readonly bandeau = signal<string | null>(null);          // refus du serveur qui ne vise pas un champ

  private readonly montant = toSignal(this.form.controls.montant_demande.valueChanges, { initialValue: null });

  /** Aperçu seulement : c'est le serveur qui pose `est_derogation`. */
  readonly horsPlafond = computed(() => {
    const plafond = this.preparation()?.plafond ?? null;
    const montant = this.montant();
    return plafond !== null && montant !== null && toCentimes(montant) > toCentimes(plafond);
  });
  readonly sansEstimation = computed(() => this.preparation() !== null && this.preparation()?.plafond === null);
  readonly enRetard = computed(() => toCentimes(this.preparation()?.reste_du_precedent ?? '0') > 0);

  constructor() {
    const depuisFiche = Number(this.route.snapshot.queryParamMap.get('producteurId'));
    if (depuisFiche) this.form.controls.producteur_id.setValue(depuisFiche);

    // La préparation se recharge à chaque changement de producteur.
    this.form.controls.producteur_id.valueChanges.pipe(
      startWith(this.form.controls.producteur_id.value),
      filter((id): id is number => id !== null),
      switchMap(id => this.avances.preparer(id).pipe(catchError(() => of(null)))),
      takeUntilDestroyed(),
    ).subscribe(preparation => {
      this.preparation.set(preparation);
      const objectif = this.form.controls.objectif_kg;
      if (preparation?.estimation_kg && objectif.pristine) objectif.setValue(preparation.estimation_kg);
    });
  }

  message(cle: keyof typeof this.form.controls): string | null {
    return messageDe(this.form.controls[cle]);
  }

  envoyer(): void {
    const campagne = this.contexte.campagne();
    if (this.form.invalid || !campagne || this.envoiEnCours()) {
      this.form.markAllAsTouched();
      return;
    }
    const saisie = this.form.getRawValue();
    const corps: AvanceDemande = {
      producteur_id: saisie.producteur_id as number,
      campagne_id: campagne.id,
      date_demande: saisie.date_demande,
      montant_demande: saisie.montant_demande as Decimal,
      motif: saisie.motif.trim(),
      objectif_kg: saisie.objectif_kg as Decimal,
    };
    this.envoiEnCours.set(true);
    this.bandeau.set(null);
    this.avances.demander(corps).subscribe({
      next: avance => void this.router.navigate(['/comptabilite/avances/demandes', avance.id]),
      error: (err: unknown) => {
        this.envoiEnCours.set(false);
        this.bandeau.set(appliquerErreurs(this.form, lireErreur(err)));
      },
    });
  }
}
```

```html
<!-- comptabilite/pages/avances/demande-saisie/demande-saisie.component.html -->
<form class="card" [formGroup]="form" (ngSubmit)="envoyer()" novalidate>
  @if (bandeau(); as texte) {
    <p class="banner banner--danger" role="alert">{{ texte }}</p>
  }

  <label class="field">
    <span class="field__label">Producteur <abbr title="obligatoire">*</abbr></span>
    <app-selecteur-producteur formControlName="producteur_id" />
    @if (message('producteur_id'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </label>

  @if (preparation(); as p) {
    @if (sansEstimation()) {
      <p class="banner banner--danger">Aucune visite n'a donné d'estimation de récolte : le plafond ne peut pas être calculé. Enregistrez d'abord une visite.</p>
    } @else {
      <p class="banner banner--info">
        Plafond du jour : <strong>{{ p.plafond | montant }}</strong>
        ({{ p.part_plafond_pct | pct: 0 }} × {{ p.estimation_kg | poids }} × {{ p.prix_kg_reference | montant }}).
      </p>
    }
    @if (enRetard()) {
      <p class="banner banner--wait">Ce producteur doit encore {{ p.reste_du_precedent | montant }} sur une avance précédente.</p>
    }
  }

  <label class="field">
    <span class="field__label">Date de la demande <abbr title="obligatoire">*</abbr></span>
    <input class="field__input" type="date" formControlName="date_demande" />
    @if (message('date_demande'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </label>

  <label class="field">
    <span class="field__label">Montant demandé <abbr title="obligatoire">*</abbr></span>
    <span class="field__group">
      <input class="field__input field__input--number" appDecimal="2" inputmode="decimal" formControlName="montant_demande" />
      <span class="field__suffix">GNF</span>
    </span>
    @if (message('montant_demande'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </label>

  @if (horsPlafond()) {
    <p class="banner banner--wait">Au-dessus du plafond : dérogation à demander au gérant. Expliquez-la dans le motif.</p>
  }

  <label class="field">
    <span class="field__label">Motif <abbr title="obligatoire">*</abbr></span>
    <textarea class="field__input" rows="2" maxlength="255" formControlName="motif"></textarea>
    @if (message('motif'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </label>

  <label class="field">
    <span class="field__label">Kilos que le producteur s'engage à livrer <abbr title="obligatoire">*</abbr></span>
    <span class="field__group">
      <input class="field__input field__input--number" appDecimal="3" inputmode="decimal" formControlName="objectif_kg" />
      <span class="field__suffix">kg</span>
    </span>
    @if (message('objectif_kg'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </label>

  <footer class="form__actions">
    <a class="btn" routerLink="/comptabilite/avances/demandes">Annuler</a>
    <button type="submit" class="btn btn--primary" [disabled]="envoiEnCours() || sansEstimation()">
      {{ envoiEnCours() ? 'Envoi…' : 'Envoyer la demande' }}
    </button>
  </footer>
</form>
```

Le service ne fait qu'appeler l'API :

```ts
// comptabilite/shared/services/avances.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../config';
import { ContexteService } from '../../../core/services/contexte.service';
import { AvecRefs, Page } from '../../../shared/models/api.model';
import { Avance, AvanceDemande, AvancePreparation } from '../models/avance.model';

const AVANCES = BASE_URL + 'avances';

@Injectable({ providedIn: 'root' })
export class AvancesService {
  private readonly http = inject(HttpClient);
  private readonly contexte = inject(ContexteService);

  /** Chaque ligne arrive avec `producteur`, `campagne`… : de quoi afficher sans autre requête. */
  lister(filtres: Record<string, string> = {}): Observable<Page<AvecRefs<Avance>>> {
    return this.http.get<Page<AvecRefs<Avance>>>(AVANCES, { params: { ...this.contexte.params(), ...filtres } });
  }

  /** Avant la saisie : estimation, prix, plafond du jour et reste dû du producteur. */
  preparer(producteurId: number): Observable<AvancePreparation> {
    return this.http.get<AvancePreparation>(`${AVANCES}/preparation`,
      { params: { ...this.contexte.params(), producteur_id: String(producteurId) } });
  }

  demander(saisie: AvanceDemande): Observable<Avance> {
    return this.http.post<Avance>(AVANCES, saisie);
  }

  valider(id: number, decision: Pick<Avance, 'montant_valide' | 'motif_decision' | 'date_limite_livraison'>): Observable<Avance> {
    return this.http.post<Avance>(`${AVANCES}/${id}/valider`, decision);
  }

  refuser(id: number, motif_decision: string): Observable<Avance> {
    return this.http.post<Avance>(`${AVANCES}/${id}/refuser`, { motif_decision });
  }
}
```

`AvanceDemande` (le corps envoyé) et `AvancePreparation` (la réponse de la préparation) sont déclarés dans `comptabilite/shared/models/avance.model.ts`, à côté de l'interface `Avance`. Le sélecteur `app-selecteur-producteur` et les trois formats d'affichage (`poids`, `montant`, `pct`) sont dans l'archive.

### 2.5 Formulaire de référence, en dialogue : le paiement

Un seul composant pour verser une avance, payer une pesée, régler une dépense et payer un salaire. Il ne connaît aucune adresse : il remet la saisie à l'écran qui l'héberge.

```ts
// shared/metier/paiement-form/paiement-form.component.ts
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BASE_URL } from '../../../config';
import { ApiErreur, Decimal, Page } from '../../models/api.model';
import { MontantPipe } from '../../pipes/montant.pipe';
import { DecimalDirective } from '../../ui/champs/decimal.directive';
import { nouvelleReferenceUnique, toCentimes } from '../../utils/chaine.util';
import { appliquerErreurs, aujourdhui, messageDe } from '../../utils/formulaire.util';

export type ModePaiement = 'especes' | 'orange_money' | 'virement' | 'cheque';

/** Ce que le formulaire remet à l'écran qui l'héberge : celui-ci choisit l'adresse (verser, payer, régler). */
export interface PaiementSaisie {
  date: string;
  montant: Decimal;
  mode_paiement: ModePaiement;
  compte_tresorerie_id: number;
  reference_paiement: string | null;
  reference_unique: string;
}

interface CompteTresorerie {
  id: number;
  code: string;
  libelle: string;
  type: 'caisse' | 'banque' | 'mobile_money';
  solde: Decimal;
}

const TYPE_DU_MODE: Record<ModePaiement, CompteTresorerie['type']> = {
  especes: 'caisse', orange_money: 'mobile_money', virement: 'banque', cheque: 'banque',
};
const LIBELLE_DU_MODE: Record<ModePaiement, string> = {
  especes: 'Espèces', orange_money: 'Orange Money', virement: 'Virement', cheque: 'Chèque',
};

/**
 * Formulaire commun des paiements (avance, pesée, dépense, salaire).
 * La référence unique est créée ici, une fois, à l'ouverture : un envoi qui repart porte la même.
 */
@Component({
  selector: 'app-paiement-form',
  imports: [ReactiveFormsModule, DecimalDirective, MontantPipe],
  templateUrl: './paiement-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaiementFormComponent {
  private readonly http = inject(HttpClient);

  readonly reste = input.required<Decimal>();                        // ce qui reste à payer : montant prérempli et plafond
  readonly devise = input('GNF');                                    // devise de la ligne payée
  readonly modes = input<ModePaiement[]>(['especes', 'orange_money', 'virement']);
  readonly libelleBouton = input('Payer');
  readonly envoiEnCours = input(false);                              // tenu par l'écran hôte pendant sa requête
  readonly payer = output<PaiementSaisie>();
  readonly fermer = output<void>();

  private readonly referenceUnique = nouvelleReferenceUnique();      // une par ouverture du formulaire
  readonly libelles = LIBELLE_DU_MODE;
  readonly bandeau = signal<string | null>(null);
  readonly comptes = signal<CompteTresorerie[]>([]);

  readonly form = new FormGroup({
    date: new FormControl(aujourdhui(), { nonNullable: true, validators: Validators.required }),
    montant: new FormControl<Decimal | null>(null, Validators.required),
    mode_paiement: new FormControl<ModePaiement | null>(null, Validators.required),
    compte_tresorerie_id: new FormControl<number | null>(null, Validators.required),
    reference_paiement: new FormControl('', { nonNullable: true, validators: Validators.maxLength(50) }),
  });

  private readonly mode = toSignal(this.form.controls.mode_paiement.valueChanges, { initialValue: null });
  private readonly montant = toSignal(this.form.controls.montant.valueChanges, { initialValue: null });

  /** Seuls les comptes du mode choisi sont proposés : une caisse pour des espèces. */
  readonly comptesDuMode = computed(() => {
    const mode = this.mode();
    return mode ? this.comptes().filter(c => c.type === TYPE_DU_MODE[mode]) : [];
  });
  readonly referenceObligatoire = computed(() => this.mode() !== null && this.mode() !== 'especes');
  readonly auDessusDuReste = computed(() => {
    const montant = this.montant();
    return montant !== null && toCentimes(montant) > toCentimes(this.reste());
  });

  constructor() {
    this.http.get<Page<CompteTresorerie>>(BASE_URL + 'comptes-tresorerie', { params: { est_actif: '1', par_page: '100' } })
      .subscribe(page => this.comptes.set(page.data));
    this.form.controls.mode_paiement.valueChanges.subscribe(() => this.form.controls.compte_tresorerie_id.reset());
    // Le montant est prérempli avec le reste à payer, tant que l'utilisateur n'y a pas touché.
    effect(() => {
      const reste = this.reste();
      if (this.form.controls.montant.pristine) this.form.controls.montant.setValue(reste);
    });
  }

  /** L'écran hôte appelle `refuser()` quand sa requête échoue : le message s'affiche ici, la saisie reste. */
  refuser(erreur: ApiErreur): void {
    this.bandeau.set(appliquerErreurs(this.form, erreur));
  }

  message(cle: keyof typeof this.form.controls): string | null {
    return messageDe(this.form.controls[cle]);
  }

  envoyer(): void {
    const saisie = this.form.getRawValue();
    const referenceManque = this.referenceObligatoire() && saisie.reference_paiement.trim() === '';
    if (this.form.invalid || this.auDessusDuReste() || referenceManque || this.envoiEnCours()) {
      this.form.markAllAsTouched();
      if (referenceManque) this.form.controls.reference_paiement.setErrors({ required: true });
      return;
    }
    this.bandeau.set(null);
    this.payer.emit({
      date: saisie.date,
      montant: saisie.montant as Decimal,
      mode_paiement: saisie.mode_paiement as ModePaiement,
      compte_tresorerie_id: saisie.compte_tresorerie_id as number,
      reference_paiement: saisie.reference_paiement.trim() || null,
      reference_unique: this.referenceUnique,
    });
  }
}
```

```html
<!-- shared/metier/paiement-form/paiement-form.component.html -->
<form [formGroup]="form" (ngSubmit)="envoyer()" novalidate>
  @if (bandeau(); as texte) {
    <p class="banner banner--danger" role="alert">{{ texte }}</p>
  }

  <label class="field">
    <span class="field__label">Date <abbr title="obligatoire">*</abbr></span>
    <input class="field__input" type="date" formControlName="date" />
    @if (message('date'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </label>

  <label class="field">
    <span class="field__label">Montant <abbr title="obligatoire">*</abbr></span>
    <input class="field__input field__input--number" appDecimal="2" inputmode="decimal" formControlName="montant" />
    @if (auDessusDuReste()) {
      <small class="field__error">Le montant dépasse ce qui reste à payer ({{ reste() | montant: devise() }}).</small>
    } @else {
      @if (message('montant'); as erreur) { <small class="field__error">{{ erreur }}</small> }
    }
  </label>

  <fieldset class="field">
    <legend class="field__label">Mode de paiement <abbr title="obligatoire">*</abbr></legend>
    @for (mode of modes(); track mode) {
      <label class="field__radio"><input type="radio" formControlName="mode_paiement" [value]="mode" /> {{ libelles[mode] }}</label>
    }
    @if (message('mode_paiement'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </fieldset>

  <label class="field">
    <span class="field__label">Compte de trésorerie <abbr title="obligatoire">*</abbr></span>
    <select class="field__input" formControlName="compte_tresorerie_id">
      <option [ngValue]="null">Choisir…</option>
      @for (compte of comptesDuMode(); track compte.id) {
        <option [ngValue]="compte.id">{{ compte.libelle }} · solde {{ compte.solde | montant: devise() }}</option>
      }
    </select>
    @if (message('compte_tresorerie_id'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </label>

  <label class="field">
    <span class="field__label">Référence @if (referenceObligatoire()) { <abbr title="obligatoire">*</abbr> }</span>
    <input class="field__input" maxlength="50" formControlName="reference_paiement" />
    @if (message('reference_paiement'); as erreur) { <small class="field__error">{{ erreur }}</small> }
  </label>

  <footer class="form__actions">
    <button type="button" class="btn" (click)="fermer.emit()">Annuler</button>
    <button type="submit" class="btn btn--primary" [disabled]="envoiEnCours()">
      {{ envoiEnCours() ? 'Envoi…' : libelleBouton() }}
    </button>
  </footer>
</form>
```

L'écran hôte choisit l'adresse et le nom de la date. Ici, payer une pesée (CO-08) ; les autres écrans de paiement ne changent que ces deux lignes.

```ts
// comptabilite/pages/tresorerie/paiements-producteurs/paiements-producteurs.component.ts
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { BASE_URL } from '../../../../config';
import { Decimal, Page, Ref } from '../../../../shared/models/api.model';
import { PaiementFormComponent, PaiementSaisie } from '../../../../shared/metier/paiement-form/paiement-form.component';
import { MontantPipe } from '../../../../shared/pipes/montant.pipe';
import { toCentimes } from '../../../../shared/utils/chaine.util';
import { lireErreur } from '../../../../shared/utils/formulaire.util';

/** Ce que cet écran lit d'une pesée : chaque application déclare ce dont elle a besoin, sans importer le modèle d'une autre. */
interface PeseeAPayer {
  id: number;
  numero: string;
  producteur: Ref;
  net_a_payer: Decimal;
  montant_paye: Decimal;
  est_bloquee_humidite: boolean;
}

/** CO-08 · Payer une pesée : l'écran hôte choisit l'adresse, le formulaire commun fait le reste. */
@Component({
  selector: 'app-co-tresorerie-paiements-producteurs',
  imports: [PaiementFormComponent, MontantPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="tbl">
      @for (pesee of aPayer(); track pesee.id) {
        <li>
          {{ pesee.numero }} · {{ pesee.producteur.libelle }} · {{ pesee.net_a_payer | montant }}
          @if (!pesee.est_bloquee_humidite) {
            <button type="button" class="btn btn--primary" (click)="choisie.set(pesee)">Payer</button>
          }
        </li>
      }
    </ul>

    @if (choisie(); as pesee) {
      <section class="card" role="dialog" aria-modal="true" [attr.aria-label]="'Payer la pesée ' + pesee.numero">
        <app-paiement-form [reste]="reste()" [envoiEnCours]="envoiEnCours()" (payer)="payer(pesee, $event)" (fermer)="choisie.set(null)" />
      </section>
    }
  `,
})
export class CoTresoreriePaiementsProducteursComponent {
  private readonly http = inject(HttpClient);
  private readonly formulaire = viewChild(PaiementFormComponent);

  readonly aPayer = signal<PeseeAPayer[]>([]);
  readonly choisie = signal<PeseeAPayer | null>(null);
  readonly envoiEnCours = signal(false);

  /** Reste à payer, en chaîne à 2 décimales comme tout montant. */
  readonly reste = computed<Decimal>(() => {
    const pesee = this.choisie();
    return pesee ? ((toCentimes(pesee.net_a_payer) - toCentimes(pesee.montant_paye)) / 100).toFixed(2) : '0.00';
  });

  constructor() {
    this.charger();
  }

  private charger(): void {
    this.http.get<Page<PeseeAPayer>>(BASE_URL + 'pesees', { params: { statut: 'validee' } })
      .subscribe(page => this.aPayer.set(page.data));
  }

  payer(pesee: PeseeAPayer, saisie: PaiementSaisie): void {
    this.envoiEnCours.set(true);
    this.http.post(`${BASE_URL}pesees/${pesee.id}/payer`, {
      date_paiement: saisie.date,                               // seule clé à renommer : chaque table nomme sa date
      montant: saisie.montant,
      mode_paiement: saisie.mode_paiement,
      compte_tresorerie_id: saisie.compte_tresorerie_id,
      reference_paiement: saisie.reference_paiement,
      reference_unique: saisie.reference_unique,
    }).subscribe({
      next: () => {
        this.envoiEnCours.set(false);
        this.choisie.set(null);
        this.charger();                                         // puis rafraîchir le compteur du menu
      },
      error: (err: unknown) => {
        this.envoiEnCours.set(false);
        this.formulaire()?.refuser(lireErreur(err));            // le dialogue reste ouvert, la saisie est gardée
      },
    });
  }
}
```

| Écran | Adresse | Nom de la date | Particularité |
|-------|---------|----------------|---------------|
| CO-03 Verser une avance | `POST avances/{id}/verser` | `date_versement` | reste = montant accordé − déjà versé |
| CO-08 Payer une pesée | `POST pesees/{id}/payer` | `date_paiement` | pas de bouton si `est_bloquee_humidite` |
| CO-19 Régler une dépense | `POST depenses/{id}/payer` | `date_paiement` | mode `cheque` en plus ; devise de la dépense |
| RH-12 Payer un salaire | `POST bulletins/{id}/payer` | `date_paiement` | mode prérempli avec celui de l'employé |
| CO-09 Encaisser une facture | `POST factures/{id}/encaisser` | `date_encaissement` | formulaire à part : montant en devise et taux du jour en plus |

**Ce qui a été exécuté.** Ces fichiers tournent dans un vrai moteur Angular (sans navigateur), avec un faux serveur : 58 contrôles, tous conformes. Entre autres : « 1 496,5 » devient `"1496.500"` ; le corps de `POST avances` et celui de `POST pesees/1/payer` sont, clé pour clé, les exemples de ce guide ; une erreur `422` s'écrit sous son champ et un refus `409` en bandeau, saisie gardée ; un nouvel essai après un refus porte la même `reference_unique`.

---

## 3. Lire une fiche d'action

Chaque action a un code (`TE-05`), repris dans tout le guide. Sa fiche se lit de haut en bas, dans l'ordre où le développeur en a besoin.

| Ligne | Ce qu'elle dit | Ce qu'on en fait dans le code |
|-------|----------------|-------------------------------|
| **Permission** | la permission exacte, telle qu'elle est dans `AuthUser.permissions` | `@if (auth.can('…'))` autour du bouton ; l'API la revérifie |
| **Où** | l'écran, le bouton, et la forme : page, dialogue, confirmation (`default-confirm`) ou motif (`default-prompt`) | l'emplacement du bouton et le gabarit |
| **État** | l'état de la ligne avant et après l'action | le bouton n'apparaît que dans l'état de départ ; la pastille change avec la réponse |
| **Quand** | les autres conditions | à tester avant d'afficher le bouton, quand l'écran les connaît |
| **Avant la saisie** | les requêtes qui remplissent les sélecteurs et la préparation | à lancer à l'ouverture du formulaire |
| **Envoi** | la méthode et l'adresse | une méthode du service du module |
| **Formulaire** | un champ par ligne : libellé, clé envoyée, type de saisie, obligatoire, règle et valeur par défaut | les contrôles du `FormGroup` et leurs validateurs |
| **Rempli par le serveur** | les colonnes obligatoires que le formulaire ne porte pas | à ne pas envoyer ; à afficher depuis la réponse |
| **Exemple** | un corps de requête complet, puis parfois un extrait de la réponse | le jeu d'essai du service en mode démonstration |
| **Le serveur** | ce que l'action écrit, table par table | à savoir pour expliquer l'écran suivant ; c'est aussi la liste de ce que l'API doit faire |
| **Refus** | les motifs propres à l'action (`409` sauf mention) | un message prévu pour chacun ; les refus communs sont au §1.7 |
| **Ensuite** | où va l'écran, quels compteurs rafraîchir | la suite du `subscribe` |
| **Aussi** | les gestes voisins sous la même permission : modifier, annuler, désactiver | d'autres méthodes du même service |

Dans le tableau « Formulaire » : une clé `sacs[].poids_kg` est une colonne d'une **ligne de tableau** (`"sacs": [{ "poids_kg": "84.000" }]`) ; un libellé entre parenthèses, comme *(campagne choisie)*, est une valeur que l'écran envoie sans la demander.

---

## 4. Une campagne, action par action

Le fil de la campagne de Sékou Camara, qui sert d'exemple dans tous les documents du projet : dans quel ordre les actions s'enchaînent, et qui fait quoi. C'est aussi un bon ordre pour développer et pour recetter.

| # | Qui | Geste | Actions | Sékou Camara |
|---|---|---|---|---|
| 1 | Gérant | Régler les référentiels | AD-04, AD-05, AD-11, AD-07, AD-08 | Prix d'achat de 6 000 GNF le kilo ; plafond d'avance et retenue à 40 % ; campagne Cajou 2026 ouverte |
| 2 | Gérant | Créer les comptes | AD-01 | Un compte par personne, avec sa zone ou son dépôt |
| 3 | Superviseur | Inscrire le producteur | TE-01, TE-03 | Sékou Camara, village de Dabiss ; champ `KOL-017` de 4 ha |
| 4 | Superviseur | Visiter le champ | TE-04 | Récolte estimée : 1 600 kg |
| 5 | Superviseur | **Demande** l'avance | CO-01 | 2 000 000 GNF demandés ; plafond du jour 3 840 000 GNF |
| 6 | Gérant | **Décide** l'avance | CO-02 ou PI-03 | Accordée en entier |
| 7 | Comptable | **Verse** l'avance | CO-03 | 2 000 000 GNF en espèces le 10 décembre 2025 ; reçu signé joint |
| 8 | Superviseur | Pèse et valide | TE-05, TE-06 | 420 kg à 14 % d'humidité : 2 520 000 GNF, retenue 1 008 000, net 1 512 000 |
| 9 | Comptable | Paie la pesée | CO-08 | 1 512 000 GNF par Orange Money |
| 10 | Superviseur | Envoie au dépôt | TE-08, TE-09 | 19 sacs, 1 500 kg, quatre pesées |
| 11 | Responsable de dépôt | Reçoit et range | DE-01, DE-02 | 1 496 kg repesés, écart de −4 kg ; lot `KOL-2026-012` |
| 12 | Responsable de dépôt | Traite | DE-04, DE-05 | Séchage puis tri : 1 395 kg secs à 9 %, perte de 6,8 % |
| 13 | Ventes | Compose le lot de vente | VE-02, VE-03 | Lot de vente `BK-2026-07`, 1 395 kg |
| 14 | Responsable de dépôt | Sort le lot | DE-07 | 1 395 kg pesés à la sortie |
| 15 | Ventes | Vend et facture | VE-04, VE-05, VE-06, VE-07 | 1 350 USD la tonne au taux de 8 700 : 1 883,25 USD, soit 16 384 275 GNF |
| 16 | Import-export | Tient le dossier | VE-09, VE-10, VE-12, VE-13 | Pièces reçues, frais de transit et de douane, embarquement |
| 17 | Gérant | Valide les pièces | VE-11 | Le dossier devient complet : l'embarquement est possible |
| 18 | Comptable | Saisit et règle les dépenses | CO-17, CO-18, CO-19 | Transport, main-d'œuvre, sacs, transit, douane : 2 720 250 GNF |
| 19 | Comptable | Encaisse | CO-09 | 1 883,25 USD au taux de 8 720 : 16 421 940 GNF, gain de change de 37 665 GNF |
| 20 | Gérant | Lit le résultat | Ventes → Marges, Pilotage | Coût de revient 11 720 250 GNF ; marge 4 664 025 GNF, soit 3 343 GNF par kilo sec |

Celui qui saisit n'est pas celui qui valide : trois personnes pour une avance, deux pour un transfert de fonds, une clôture de caisse ou un inventaire. Pour tout ce qui passe par `avances` et `approbations`, la base elle-même refuse qu'une personne décide ce qu'elle a demandé ; ailleurs, ce sont deux permissions distinctes qui séparent les rôles.

---

## 5. Session et gestes communs

Ces gestes ne dépendent d'aucune application : ils servent partout. Leurs adresses sont dans `API_PATHS` (`config.ts`).

### 5.1 Connexion et mot de passe

#### SE-01 · Se connecter

- **Permission** : page publique `/auth`
- **Où** : formulaire en page
- **Envoi** : `POST auth/login`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Téléphone | `telephone` | téléphone (20) | oui | identifiant de connexion, format `+224…` ; espaces retirés avant l'envoi |
| Mot de passe | `mot_de_passe` | mot de passe (masqué) | oui | jamais gardé en mémoire ni dans le stockage du navigateur |

```json
{
  "telephone": "+2246XXXXXXXX", "mot_de_passe": "••••••••"
}
```

Réponse (extrait) :

```json
{ "token": "…", "user": { "id": 3, "nom": "Démo", "prenom": "Superviseur", "initiales": "SD", "telephone": "+2246XXXXXXXX",
  "role": { "code": "SUPERVISEUR", "libelle": "Superviseur des champs" }, "permissions": ["terrain.pesee.saisir", "…"],
  "perimetre": { "zone_ids": [17], "depot_ids": [] }, "producteur_id": null, "est_mot_de_passe_provisoire": false } }
```

- **Le serveur** :
  - écrit une ligne dans `connexions`, que la tentative réussisse ou non (`telephone_saisi`, `ip`, `appareil`, `est_reussie`) ;
  - met à jour `utilisateurs.derniere_connexion`.
- **Refus** :
  - `IDENTIFIANTS_INCORRECTS` (401) — Téléphone ou mot de passe incorrect : le message ne dit jamais lequel des deux.
  - `COMPTE_DESACTIVE` (403) — Le compte existe mais `utilisateurs.est_actif` vaut 0.
  - `TROP_DE_TENTATIVES` (429) — Trop d'essais ratés : attendre avant de réessayer.
- **Ensuite** : `AuthService.landingUrl()` : mot de passe provisoire → `/auth/mot-de-passe` ; une seule application permise → cette application ; sinon `/portail`. Puis `GET contexte`.

#### SE-02 · Changer son mot de passe

- **Permission** : tout utilisateur connecté ; **obligatoire** tant que `est_mot_de_passe_provisoire` est vrai
- **Où** : formulaire en page
- **Envoi** : `POST auth/mot-de-passe`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Mot de passe actuel | `mot_de_passe_actuel` | mot de passe (masqué) | oui | le mot de passe provisoire à la première connexion |
| Nouveau mot de passe | `nouveau_mot_de_passe` | mot de passe (masqué) | oui | 8 caractères au moins ; différent de l'actuel |
| Confirmer | `confirmation` | mot de passe (masqué) | oui | comparé dans le navigateur ; **non envoyé** |

- **Le serveur** :
  - remplace `utilisateurs.mot_de_passe` (résultat de `password_hash()`), passe `utilisateurs.est_mot_de_passe_provisoire` à 0 ;
  - écrit `journal_activites` (action `modification`, sans les valeurs).
- **Refus** :
  - `MOT_DE_PASSE_ACTUEL_INCORRECT` — Le mot de passe actuel ne correspond pas.
- **Ensuite** : mettre à jour l'utilisateur en mémoire (`est_mot_de_passe_provisoire` à faux), puis `AuthService.landingUrl()`.

#### SE-03 · Recharger la session

- **Permission** : tout utilisateur connecté
- **Quand** : au démarrage de l'application quand un jeton existe, et après un changement de rôle signalé par un 403
- **Envoi** : `GET auth/me`
- **Le serveur** : renvoie le même objet `user` que la connexion (`AuthUser`) : rôle, permissions et périmètre du moment.
- **Refus** :
  - `SESSION_EXPIREE` (401) — Jeton absent, expiré ou révoqué : l'intercepteur ouvre `default-session-expired` et renvoie vers `/auth`.

#### SE-04 · Se déconnecter

- **Permission** : tout utilisateur connecté
- **Où** : menu utilisateur de la barre supérieure
- **Envoi** : `POST auth/logout`
- **Le serveur** : révoque le jeton.
- **Ensuite** : le front vide `ca_token` et `ca_user`, garde `ca_sidebar` et `ca_campagne`, puis ouvre `/auth`. Si la requête échoue, le front se déconnecte quand même.

### 5.2 Barre supérieure

#### SE-05 · Choisir la campagne

- **Permission** : tout utilisateur connecté
- **Où** : sélecteur de la barre supérieure
- **Envoi** : `GET contexte`
Réponse (extrait) :

```json
{ "campagnes": [{ "id": 1, "code": "CAJOU-2026", "libelle": "Cajou 2026", "produit_id": 1, "statut": "ouverte" }],
  "produits": [{ "id": 1, "code": "CAJOU", "nom": "Cajou" }], "devises": [{ "id": 1, "code": "GNF", "nombre_decimales": 0 }],
  "perimetre": { "zones": [{ "id": 17, "nom": "Kolaboui" }], "depots": [] } }
```

- **Le serveur** : ne modifie rien : le choix reste dans le navigateur (`ContexteService.choisir(id)`, clé `ca_campagne`).
- **Ensuite** : chaque requête de liste joint `campagne_id` et `produit_id` (`contexte.params()`). Changer de campagne recharge la page ; une saisie en cours demande confirmation.

#### SE-06 · Lire les compteurs du menu

- **Permission** : tout utilisateur connecté
- **Quand** : à l'ouverture d'une application, puis après chaque action qui change un compteur (ligne « Ensuite » des fiches)
- **Envoi** : `GET menus/compteurs?module=comptabilite`
Réponse (extrait) :

```json
{ "avances-validation": 3, "avances-decaissement": 1, "tresorerie-paiements-producteurs": 12 }
```

- **Le serveur** : compte seulement ce que l'utilisateur a le droit de voir, dans son périmètre ; clé = `id` de l'entrée de menu.
- **Ensuite** : `MenuService.setBadges()` ; pour un seul compteur, `MenuService.setBadge(id, n)`.

### 5.3 Blocs communs à toutes les fiches

#### SE-07 · Joindre un fichier

- **Permission** : la permission de saisie de la fiche qui porte le bloc `shared/metier/pieces-jointes/`
- **Où** : envoi `multipart/form-data`, un fichier par requête
- **Envoi** : `POST pieces-jointes`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| (fixé par l'écran) | `table_cible` | aucun champ | oui | nom de la table de la fiche : `visites`, `depenses`, `dossier_documents`… |
| (fixé par l'écran) | `ligne_id` | aucun champ | oui | identifiant de la ligne |
| Nature du fichier | `categorie` | liste : `photo` · `recu_signe` · `justificatif` · `piece_identite` · `document_dossier` · `contrat` · `autre` | oui | préremplie par l'écran : `photo` pour une visite, `justificatif` pour une dépense, `recu_signe` après un paiement |
| Fichier | `fichier` | fichier | oui | image JPEG ou PNG, ou PDF ; photo compressée dans le navigateur avant l'envoi (réseau lent) |

**Rempli par le serveur** : `nom_fichier`, `chemin`, `type_mime`, `taille_octets`, `empreinte_sha256`.

- **Le serveur** : range le fichier hors du dossier public et écrit `pieces_jointes` avec son empreinte : un fichier remplacé après coup se détecte.
- **Refus** :
  - `FICHIER_TROP_LOURD` (413) — Taille au-dessus de la limite fixée par le serveur.
  - `TYPE_DE_FICHIER_REFUSE` (415) — Ni image ni PDF.
- **Ensuite** : la vignette apparaît dans le bloc. Pas de bouton « Supprimer » sur une ligne validée : on ajoute, on ne retire pas.
- **Aussi** :
  - Lister les fichiers d'une ligne : `GET pieces-jointes?table_cible=visites&ligne_id=12`
  - Ouvrir un fichier : `GET pieces-jointes/{id}/fichier` — réponse binaire, lue avec le jeton : pas de lien direct vers le fichier

#### SE-08 · Lire l'historique d'une ligne

- **Permission** : la permission de lecture de la fiche qui porte l'onglet Historique (`shared/metier/historique/`)
- **Envoi** : `GET historique?table_cible=avances&ligne_id=1`
Réponse (extrait) :

```json
{ "statuts": [{ "ancien_statut": "proposee", "nouveau_statut": "validee", "utilisateur_id": 1, "utilisateur": { "id": 1, "libelle": "Démo Gérant" },
               "date_transition": "2025-12-09 10:00:00", "motif": "Sous le plafond" }],
  "activites": [{ "action": "validation", "utilisateur_id": 1, "utilisateur": { "id": 1, "libelle": "Démo Gérant" }, "date_action": "2025-12-09 10:00:00" }] }
```

- **Le serveur** : lit `statut_historiques` et `journal_activites` de la ligne ; le front n'écrit jamais dans ces deux tables.

#### SE-09 · Ouvrir, imprimer ou vérifier un document

- **Permission** : la permission de lecture de la fiche d'origine ; la vérification est ouverte à `administration.document.voir`
- **Où** : bloc `shared/metier/document-pdf/` : aperçu, impression, code de vérification
- **Envoi** : `GET documents/{id}/pdf`
- **Le serveur** :
  - les PDF (reçu d'avance, reçu de pesée, bordereau, facture, bulletin, reçu de paiement) sont **produits par le serveur** au moment de l'action ; le front ne fabrique aucun reçu ;
  - chaque document porte un `numero`, une `empreinte_sha256` et un `code_verification` imprimé sous le QR code.
- **Aussi** :
  - Lister les documents d'une ligne : `GET documents?table_cible=pesees&ligne_id=1`
  - Compter une réimpression : `POST documents/{id}/reimprimer` — incrémente `documents_emis.nombre_impressions` ; le PDF réimprimé porte la mention « Duplicata »
  - Vérifier un papier : `GET documents/verifier?code=K7P2-9QXD` — renvoie le document et sa ligne d'origine, ou 404

---

## 6. Pilotage

`pilotage/` · préfixe `pi` · espace : Administrateur (gérant) · 6 pages, 3 actions · application à ouvrir (`status: 'soon'`)

L'application du gérant. Elle lit toutes les autres : trois tables à elle (`objectifs`, `alertes`, `approbations`), le reste vient des vues calculées. Trois formulaires seulement, tous courts.

Une alerte ou une approbation porte `table_cible` et `ligne_id` : l'écran affiche toujours le lien « Ouvrir » vers la ligne concernée (`core/navigation/origines.ts`), pour décider en voyant la pièce.

### 6.1 Tableau de bord — `/pilotage/tableau-de-bord`

**Lecture** · `pilotage.tableau.voir` · `GET tableau-de-bord`

Lecture seule, une requête : collecte et objectif, avances versées et reste dû (`v_solde_avances`), stock par dépôt (`v_stock_depots`), ventes et marges (`v_marges_lots_vente`), nombre d'alertes ouvertes et de décisions en attente. Chaque chiffre est un lien vers la liste filtrée qui l'explique.

### 6.2 Collecte par zone — `/pilotage/collecte-zones`

**Lecture** · `pilotage.tableau.voir` · `GET collecte/zones`

Lecture seule (`v_collecte_zones`, `v_collecte_villages`) : l'arbre des zones, chaque niveau additionnant ce qu'il contient, comparé à son objectif.

### 6.3 Objectifs de collecte — `/pilotage/objectifs`

**Lecture** · `pilotage.objectif.voir` · `GET objectifs` · filtres : `campagne_id`, `zone_id`, `superviseur_id`

**Colonnes de la liste** : `campagne_id`, `zone_id`, `superviseur_id`, `objectif_kg`

Un tableau : une ligne par zone et par superviseur, avec l'objectif, le réalisé et le taux d'atteinte.

#### PI-01 · Fixer un objectif de collecte

- **Permission** : `pilotage.objectif.saisir`
- **Où** : bouton « Nouvel objectif », ou cellule modifiable du tableau · formulaire en dialogue
- **Envoi** : `POST objectifs`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| (campagne choisie) | `campagne_id` | aucun champ | oui | pris dans `ContexteService` |
| Zone | `zone_id` | sélecteur → `zones` | — | vide : objectif de toute l'entreprise |
| Superviseur | `superviseur_id` | sélecteur → `utilisateurs` | — | vide : objectif de la zone entière |
| Objectif | `objectif_kg` | poids en kg | oui | en kilos ; supérieur à 0 |

```json
{
  "campagne_id": 1, "zone_id": 17, "superviseur_id": 3, "objectif_kg": "120000.000"
}
```

- **Refus** :
  - `OBJECTIF_DEJA_FIXE` — Un objectif existe déjà pour cette campagne, cette zone et ce superviseur : le modifier.
- **Aussi** :
  - Modifier : `PUT objectifs/{id}` — seul `objectif_kg` change

> L'objectif de l'exemple est une valeur d'illustration.

### 6.4 Alertes — `/pilotage/alertes`

**Lecture** · `pilotage.alerte.voir` · `GET alertes` · filtres : `type`, `niveau`, `statut`, `zone_id`, `du`, `au`

**Colonnes de la liste** : `date_alerte`, `type`, `niveau`, `message`, `valeur_mesuree`, `seuil`, `zone_id`, `statut`

Les alertes ne se créent jamais à la main : le serveur les lève (avance sans livraison, perte anormale, écart de poids, humidité, client en retard, fin de contrat, dossier incomplet, écart de caisse). `valeur_mesuree` et `seuil` s'affichent côte à côte.

#### PI-02 · Traiter une alerte

- **Permission** : `pilotage.alerte.traiter`
- **Où** : boutons de la ligne ou du panneau de détail : « Je m'en occupe », « Traitée », « Ignorer » · formulaire en dialogue
- **État** (`alertes.statut`) : `ouverte` → `en_cours` (Prendre en charge) · `ouverte` ou `en_cours` → `traitee` (Traiter) · `ouverte` ou `en_cours` → `ignoree` (Ignorer)
- **Envoi** : `POST alertes/{id}/traiter`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Ce qui a été fait | `commentaire` | texte (255) | oui | obligatoire pour clore ou ignorer |

```json
{
  "commentaire": "Producteur rencontré : livraison prévue la semaine prochaine"
}
```

- **Le serveur** : renseigne `traitee_par` et `date_traitement`.
- **Ensuite** : rafraîchir le compteur `alertes`.
- **Aussi** :
  - Prendre en charge : `POST alertes/{id}/prendre-en-charge` — sans corps ; `ouverte` → `en_cours`
  - Ignorer : `POST alertes/{id}/ignorer` — même corps ; `ignoree` : l'alerte n'appelait aucune action

### 6.5 Approbations — `/pilotage/approbations`

**Lecture** · `pilotage.approbation.voir` · `GET approbations` · filtres : `type`, `decision`, `demande_par`, `du`, `au`

**Colonnes de la liste** : `date_demande`, `type`, `table_cible`, `ligne_id`, `demande_par`, `decision`, `decide_par`, `date_decision`

File des décisions du gérant, celles `en_attente` d'abord. Chaque ligne résume la pièce (producteur et montant d'une avance, lot et perte d'un déblocage) et la lie.

#### PI-03 · Décider une approbation

- **Permission** : `pilotage.approbation.decider`
- **Où** : boutons « Approuver » et « Refuser » d'une ligne `en_attente` ; masqués quand `demande_par` est l'utilisateur connecté · formulaire en dialogue
- **État** (`approbations.decision`) : `en_attente` → `approuvee` (Approuver) · `en_attente` → `reduite` (Approuver un montant réduit) · `en_attente` → `refusee` (Refuser)
- **Envoi** : `POST approbations/{id}/decider`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Décision | `decision` | liste : `en_attente` · `approuvee` · `reduite` · `refusee` | oui | limitée à `approuvee`, `reduite` et `refusee` |
| Motif | `motif` | texte (255) | — | obligatoire pour `reduite` et `refusee` |
| Montant accordé | `montant_valide` | montant | — | seulement pour une avance `reduite` |

```json
{
  "decision": "approuvee", "motif": "Sous le plafond"
}
```

- **Le serveur** :
  - renseigne `decide_par` et `date_decision`, puis applique la décision à la pièce, dans la même transaction :
  - `avance` et `derogation_plafond` : l'avance passe à `validee` ou `refusee`, comme par CO-02 ;
  - `deblocage_lot` : le lot `bloque` redevient vendable, `lots.debloque_par` est renseigné ; refusé, il reste bloqué ;
  - `transfert_fonds` : le transfert passe à `valide` et l'argent sort du compte source ; `paie` : la paie du mois est validée.
- **Refus** :
  - `DEMANDEUR_EGAL_DECIDEUR` (403) — La personne qui a demandé ne peut pas décider (contrainte de la base).
  - `DEJA_DECIDEE` — La demande n'est plus `en_attente`.
- **Ensuite** : rafraîchir le compteur `approbations`.

### 6.6 Rapports — `/pilotage/rapports`

**Lecture** · `pilotage.rapport.voir` · `GET resultat-campagnes` · `GET collecte/zones` · `GET marges`

Lecture seule : résultat par campagne (`v_resultat_campagnes`), collecte, stock, marges. Export par CO-22.

---

## 7. Producteurs et collecte

`terrain/` · préfixe `te` · espace : Superviseur des champs · 13 pages, 9 actions · application à ouvrir (`status: 'soon'`)

L'application du superviseur des champs, souvent au téléphone et avec peu de réseau : formulaires courts, une colonne, valeurs par défaut partout où c'est possible.

Le serveur limite déjà chaque liste à la zone du superviseur (§13.5 d'ARCHITECTURE.md) : aucun formulaire n'envoie de zone « pour filtrer ». `superviseur_id` est rempli par le serveur avec l'utilisateur connecté ; seul le gérant peut choisir un autre superviseur.

### 7.1 Producteurs — `/terrain/producteurs`

**Liste** · `terrain.producteur.voir` · `GET producteurs` · filtres : `recherche`, `village_id`, `statut`, `superviseur_id`

**Colonnes de la liste** : `code`, `nom`, `prenom`, `telephone`, `village_id`, `superviseur_id`, `statut`

`recherche` porte sur le code, le nom, le prénom et le téléphone. Le sélecteur de producteur des autres formulaires (`shared/metier/selecteurs/`) appelle la même requête avec `recherche` et `par_page=10`.

**Fiche** · `/terrain/producteurs/:producteurId` · `GET producteurs/{id}`

La fiche renvoie le producteur, ses produits, et `manques` : ce qui manque au dossier pour devenir `actif`. Les onglets Champs, Visites, Avances et Pesées appellent chacun leur liste filtrée par `producteur_id` ; l'onglet Fiche de parcours lit `GET producteurs/{id}/parcours`.

#### TE-01 · Créer un producteur

- **Permission** : `terrain.producteur.saisir`
- **Où** : bouton « Nouveau producteur » de la liste · formulaire en dialogue
- **État** (`producteurs.statut`) : (création) → `incomplet`
- **Avant la saisie** : `GET zones?niveau=village` — villages de ma zone
- **Envoi** : `POST producteurs`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Nom | `nom` | texte (80) | oui | affiché en majuscules |
| Prénom | `prenom` | texte (80) | oui | — |
| Sexe | `sexe` | liste : `M` · `F` | — | — |
| Téléphone | `telephone` | téléphone (20) | oui | `+224` puis 9 chiffres ; sert au paiement par Orange Money |
| Village | `village_id` | sélecteur → `zones` | oui | sélecteur limité aux villages de la zone du superviseur |
| Date d'adhésion | `date_adhesion` | date | — | défaut : aujourd'hui |
| Pièce d'identité | `type_piece` | liste : `cni` · `passeport` · `carte_electeur` · `autre` | — | — |
| Numéro de la pièce | `numero_piece` | texte (50) | — | obligatoire si un type est choisi ; masqué dans les listes |
| Produits cultivés | `produit_ids` | tableau d'identifiants de `produits` | oui | au moins un ; prérempli avec le produit de la campagne choisie |

**Rempli par le serveur** : `code`, `superviseur_id`.

```json
{
  "nom": "CAMARA", "prenom": "Sékou", "sexe": "M", "telephone": "+2246XXXXXXXX", "village_id": 42,
  "date_adhesion": "2025-11-15", "type_piece": "cni", "numero_piece": "[NUMÉRO]", "produit_ids": [1]
}
```

- **Le serveur** :
  - attribue le `code` (`PR-000001`) et écrit `producteur_produits` ;
  - crée le compte du producteur dans `tiers` (type `producteur`) : c'est lui qui portera ses avances et ses achats en comptabilité.
- **Refus** :
  - `TELEPHONE_DEJA_UTILISE` — Un autre producteur porte ce numéro : `details` donne son code.
  - `VILLAGE_HORS_PERIMETRE` (403) — Le village n'est pas dans la zone du superviseur.
- **Ensuite** : ouvrir la fiche créée : le bandeau « Dossier incomplet » liste `manques` et propose « Ajouter un champ ».
- **Aussi** :
  - Modifier la fiche : `PUT producteurs/{id}` — mêmes champs ; le `code` ne change jamais
  - Désactiver : `POST producteurs/{id}/desactiver` — la fiche disparaît des sélecteurs, reste dans les opérations passées ; refusé s'il reste une avance non soldée

#### TE-02 · Suspendre ou réactiver un producteur

- **Permission** : `terrain.producteur.saisir`
- **Où** : menu « Plus » de la fiche · dialogue de motif (`default-prompt`)
- **État** (`producteurs.statut`) : `actif` → `suspendu` (Suspendre) · `suspendu` → `actif` (Réactiver)
- **Envoi** : `POST producteurs/{id}/suspendre`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Motif | `motif` | texte (255) | oui | écrit dans `statut_historiques.motif` |

```json
{
  "motif": "Livraisons vendues à un autre acheteur"
}
```

- **Le serveur** : un producteur suspendu ne reçoit plus d'avance ; ses pesées restent possibles pour qu'il rembourse.
- **Aussi** :
  - Réactiver : `POST producteurs/{id}/reactiver` — même dialogue de motif

### 7.2 Champs — `/terrain/champs`

**Liste** · `terrain.champ.voir` · `GET champs` · filtres : `recherche`, `producteur_id`, `village_id`, `produit_id`, `est_actif`

**Colonnes de la liste** : `code`, `producteur_id`, `village_id`, `produit_id`, `surface_ha`, `nombre_arbres`, `arbres_productifs`, `est_actif`

**Fiche** · `/terrain/champs/:champId` · `GET champs/{id}`

Position sur la carte, surface, arbres, puis la liste des visites du champ et la dernière estimation.

#### TE-03 · Enregistrer un champ

- **Permission** : `terrain.champ.saisir`
- **Où** : bouton « Nouveau champ » de la liste, ou « Ajouter un champ » de la fiche du producteur (producteur prérempli) · formulaire en dialogue
- **Envoi** : `POST champs`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Producteur | `producteur_id` | sélecteur → `producteurs` | oui | — |
| Village | `village_id` | sélecteur → `zones` | oui | prérempli avec le village du producteur |
| Produit | `produit_id` | sélecteur → `produits` | oui | prérempli avec le produit de la campagne choisie |
| Surface | `surface_ha` | nombre (2 déc.) | oui | en hectares ; supérieure à 0 |
| Nombre d'arbres | `nombre_arbres` | entier | — | — |
| Arbres productifs | `arbres_productifs` | entier | — | inférieur ou égal au nombre d'arbres |
| Latitude | `latitude` | coordonnée GPS | — | bouton « Ma position » (`navigator.geolocation`) ; saisie à la main possible |
| Longitude | `longitude` | coordonnée GPS | — | — |
| Contour | `contour` | JSON | — | polygone GeoJSON si le tour du champ est relevé ; sinon vide |
| Date du relevé | `date_releve` | date | — | défaut : aujourd'hui quand une position est donnée |

**Rempli par le serveur** : `code`.

```json
{
  "producteur_id": 1, "village_id": 42, "produit_id": 1, "surface_ha": "4.00", "nombre_arbres": 440,
  "arbres_productifs": 412, "latitude": "10.7654321", "longitude": "-14.4567890", "contour": null,
  "date_releve": "2025-11-20"
}
```

- **Le serveur** :
  - attribue le `code` du champ à partir du code de la zone (`KOL-017`) ;
  - peut faire passer le producteur de `incomplet` à `actif`.
- **Aussi** :
  - Modifier : `PUT champs/{id}` — mêmes champs ; producteur et produit ne changent plus après la première visite
  - Désactiver : `POST champs/{id}/desactiver` — `est_actif` passe à 0 : le champ n'est plus proposé à la visite ni à la pesée

> Les coordonnées de l'exemple sont des valeurs d'illustration.

### 7.3 Visites — `/terrain/visites`

**Lecture** · `terrain.visite.voir` · `GET visites` · filtres : `champ_id`, `superviseur_id`, `etat_champ`, `stade`, `du`, `au`

**Colonnes de la liste** : `date_visite`, `champ_id`, `superviseur_id`, `etat_champ`, `stade`, `estimation_kg`

#### TE-04 · Enregistrer une visite

- **Permission** : `terrain.visite.saisir`
- **Où** : bouton « Nouvelle visite » de la liste ou de la fiche du champ · formulaire en dialogue
- **Avant la saisie** : `GET champs?recherche=…` — champs actifs de ma zone
- **Envoi** : `POST visites`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Champ | `champ_id` | sélecteur → `champs` | oui | — |
| (campagne choisie) | `campagne_id` | aucun champ | oui | pris dans `ContexteService`, jamais saisi |
| Date de la visite | `date_visite` | date | oui | défaut : aujourd'hui ; pas dans le futur |
| État du champ | `etat_champ` | liste : `bon` · `moyen` · `mauvais` | oui | boutons radio |
| Stade | `stade` | liste : `repos` · `floraison` · `fructification` · `recolte` | — | — |
| Récolte estimée | `estimation_kg` | poids en kg | — | c'est elle qui fixe le plafond d'avance |
| Observations | `observations` | texte long | — | — |

**Rempli par le serveur** : `superviseur_id`.

```json
{
  "champ_id": 1, "campagne_id": 1, "date_visite": "2025-12-05", "etat_champ": "bon",
  "stade": "floraison", "estimation_kg": "1600.000",
  "observations": "Désherbage à faire avant la récolte"
}
```

- **Le serveur** : la dernière estimation du champ devient l'estimation de référence du producteur pour la campagne.
- **Ensuite** : proposer d'ajouter les photos (SE-07, `table_cible` = `visites`, `categorie` = `photo`).
- **Aussi** :
  - Corriger une visite : `PUT visites/{id}` — par son auteur ; `journal_activites` garde les valeurs d'avant

### 7.4 Carte et zones — `/terrain/carte`

**Lecture** · `terrain.carte.voir` · `GET champs?avec_gps=1` · `GET collecte/zones`

Lecture seule. Leaflet n'est chargé que sur cette page. Un point par champ (`latitude`, `longitude`) ou son `contour` ; la couleur d'une zone suit sa collecte (`v_collecte_zones`). Un clic ouvre la fiche du champ.

### 7.5 Nouvelle pesée — `/terrain/pesees/nouvelle`

**Accès** · `terrain.pesee.saisir`

Formulaire en page, pensé pour le téléphone. C'est le geste le plus fréquent de l'application : trois zones — qui et où, le poids, le résultat calculé.

#### TE-05 · Enregistrer une pesée

- **Permission** : `terrain.pesee.saisir`
- **Où** : formulaire en page
- **État** (`pesees.statut`) : (création) → `saisie`
- **Quand** : campagne `ouverte` ; producteur non désactivé
- **Avant la saisie** : `GET producteurs?recherche=…` — producteur ; `GET champs?producteur_id=1&est_actif=1` — ses champs ; un seul champ : prérempli ; `GET pesees/preparation?producteur_id=1&champ_id=1&date_pesee=2026-03-18` — `prix_kg`, `taux_retenue_pct`, `humidite_max_achat`, `reste_du_avances`, `poids_sac_kg` à cette date
- **Envoi** : `POST pesees`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Producteur | `producteur_id` | sélecteur → `producteurs` | oui | — |
| Champ | `champ_id` | sélecteur → `champs` | oui | limité aux champs du producteur |
| (campagne choisie) | `campagne_id` | aucun champ | oui | pris dans `ContexteService` |
| Pesée notée sur papier | `est_saisie_differee` | case à cocher | — | cochée : le champ de date s'ouvre (§17.7 d'ARCHITECTURE.md) |
| Date et heure de la pesée | `date_pesee` | date et heure | oui | défaut : maintenant, en lecture seule ; modifiable seulement si la case précédente est cochée ; pas dans le futur |
| Nombre de sacs | `nombre_sacs` | entier | oui | au moins 1 |
| Poids brut | `poids_brut_kg` | poids en kg | oui | supérieur à 0 ; attention si le poids par sac s'écarte beaucoup de `poids_sac_kg` |
| Tare | `tare_kg` | poids en kg | — | poids des sacs vides ; inférieure au poids brut |
| Humidité | `humidite_pct` | pourcentage | oui | entre 0 et 100 ; au-dessus de `humidite_max_achat` : bandeau rouge « Paiement bloqué » |
| Numéro du sac | `sacs[].numero_sac` | texte (30) | oui | lu sur l'étiquette ; unique dans la pesée |
| Poids du sac | `sacs[].poids_kg` | poids en kg | — | facultatif ; si tous sont donnés, leur somme doit égaler le poids brut |

**Rempli par le serveur** : `numero`, `produit_id`, `superviseur_id`, `poids_net_kg`, `prix_kg`, `montant_brut`, `taux_retenue_pct`, `net_a_payer`.

```json
{
  "producteur_id": 1, "champ_id": 1, "campagne_id": 1, "est_saisie_differee": false,
  "date_pesee": "2026-03-18 09:30:00", "nombre_sacs": 5, "poids_brut_kg": "420.000", "tare_kg": "0.000",
  "humidite_pct": "14.00",
  "sacs": [
    { "numero_sac": "S-0001", "poids_kg": "84.000" },
    { "numero_sac": "S-0002", "poids_kg": "84.000" }
  ]
}
```

Réponse (extrait) :

```json
{ "id": 1, "numero": "PE-2026-000001", "version": 1, "poids_net_kg": "420.000", "prix_kg": "6000.00", "montant_brut": "2520000.00",
  "taux_retenue_pct": "40.00", "montant_retenue": "1008000.00", "net_a_payer": "1512000.00", "est_bloquee_humidite": false, "statut": "saisie" }
```

- **Le serveur** :
  - calcule `poids_net_kg` = brut − tare, copie le prix et le taux de retenue **de la date de la pesée**, calcule `montant_brut`, `montant_retenue` (limitée au reste dû) et `net_a_payer` ;
  - pose `est_bloquee_humidite` si l'humidité dépasse le maximum à l'achat, et lève une alerte `humidite` ;
  - écrit les `sacs` ; sans détail, crée `nombre_sacs` sacs numérotés à la suite.
- **Refus** :
  - `PRIX_ABSENT` — Aucun prix d'achat en vigueur à cette date pour ce produit et cette zone.
  - `CAMPAGNE_FERMEE` — La date tombe hors d'une campagne `ouverte`.
  - `CHAMP_HORS_PRODUCTEUR` — Le champ n'appartient pas au producteur.
  - `SAC_DEJA_UTILISE` — Un numéro de sac figure deux fois dans la pesée.
- **Ensuite** : afficher le résultat **renvoyé par le serveur** (jamais l'aperçu), puis deux boutons : « Valider » (TE-06) si la permission existe, et « Nouvelle pesée ».
- **Aussi** :
  - Modifier une pesée saisie : `PUT pesees/{id}` — tant que `statut` = `saisie` ; mêmes champs, le serveur recalcule tout
  - Annuler une pesée saisie : `POST pesees/{id}/annuler` — corps `{ "motif": "…" }` ; `saisie` → `annulee`

> Aperçu pendant la saisie avec `montantPesee`, `retenueAvance` et `netAPayer` de `chaine.util.ts`, à partir des valeurs de la requête de préparation. Sékou Camara : 420 kg × 6 000 = 2 520 000 ; retenue 40 % = 1 008 000 ; net 1 512 000 GNF.

### 7.6 Pesées — `/terrain/pesees`

**Liste** · `terrain.pesee.voir` · `GET pesees` · filtres : `recherche`, `producteur_id`, `superviseur_id`, `statut`, `est_bloquee_humidite`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_pesee`, `producteur_id`, `poids_net_kg`, `humidite_pct`, `prix_kg`, `montant_brut`, `montant_retenue`, `net_a_payer`, `statut`

Ligne de total sur le poids net, le montant, la retenue et le net. Les versions `remplacee` sont masquées par défaut (filtre « Afficher les versions remplacées »).

**Fiche** · `/terrain/pesees/:peseeId` · `GET pesees/{id}`

Renvoie la pesée, ses `sacs`, ses versions (même `numero`), ses paiements et la retenue appliquée. Le reçu se lit par SE-09 (`table_cible` = `pesees`).

#### TE-06 · Valider une pesée

- **Permission** : `terrain.pesee.valider`
- **Où** : bouton « Valider » de la fiche, ou action de ligne dans la liste (statut `saisie`) · confirmation (`default-confirm`)
- **État** (`pesees.statut`) : `saisie` → `validee`
- **Envoi** : `POST pesees/{id}/valider`
- **Le serveur** :
  - renseigne `validee_par` et `date_validation` : la pesée devient la pièce d'achat, en lecture seule ;
  - écrit la retenue dans `avance_remboursements` (`origine` = `retenue_pesee`) et met à jour `avances.montant_rembourse` ; l'avance passe à `soldee` quand tout est remboursé ;
  - passe l'écriture d'achat (`PESEE_ACHAT`) et celle de la retenue (`PESEE_RETENUE`) ;
  - émet le reçu de pesée (`documents_emis`, type `recu_pesee`) ; écrit `statut_historiques` et `journal_activites`.
- **Refus** :
  - `PERIODE_CLOTUREE` — La date de la pesée tombe dans une période comptable clôturée.
- **Ensuite** : proposer « Imprimer le reçu » ; rafraîchir le compteur `pesees` ; la pesée apparaît en Comptabilité → Paiements aux producteurs.

#### TE-07 · Corriger une pesée validée

- **Permission** : `terrain.pesee.corriger`
- **Où** : bouton « Corriger » de la fiche (statut `validee`) · formulaire en page
- **État** (`pesees.statut`) : `validee` → `remplacee` (ancienne version) · (création) → `validee` (nouvelle version)
- **Envoi** : `POST pesees/{id}/versions`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Motif de la correction | `motif` | texte (255) | oui | écrit dans `statut_historiques.motif` |
| Date et heure de la pesée | `date_pesee` | date et heure | oui | préremplie |
| Nombre de sacs | `nombre_sacs` | entier | oui | prérempli |
| Poids brut | `poids_brut_kg` | poids en kg | oui | prérempli |
| Tare | `tare_kg` | poids en kg | — | préremplie |
| Humidité | `humidite_pct` | pourcentage | oui | préremplie |

- **Le serveur** :
  - crée la version suivante (même `numero`, `version` + 1, `pesee_origine_id`) ; l'ancienne passe à `remplacee` ;
  - extourne les écritures et la retenue de l'ancienne version, puis passe celles de la nouvelle ; émet un nouveau reçu.
- **Refus** :
  - `PESEE_PAYEE` — Un paiement existe : l'annuler d'abord en Comptabilité (CO-08).
  - `SACS_DEJA_RECUS` — Les sacs sont déjà entrés au dépôt : l'écart se traite à l'entrée, pas à la pesée.
- **Ensuite** : ouvrir la nouvelle version ; l'ancienne reste lisible dans l'onglet Versions.
- **Aussi** :
  - Annuler une pesée validée : `POST pesees/{id}/annuler` — corps `{ "motif": "…" }` ; `validee` → `annulee`, écritures et retenue extournées ; mêmes refus

### 7.7 Reçus de pesée — `/terrain/recus`

**Lecture** · `terrain.recu.voir` · `GET documents?type_document=recu_pesee` · filtres : `recherche`, `du`, `au`

**Colonnes de la liste** : `date_emission`, `numero`, `emis_par`, `nombre_impressions`

Lecture seule. Les reçus sont produits à la validation (TE-06) ; ici on les retrouve et on les réimprime (SE-09).

### 7.8 Envois au dépôt — `/terrain/envois`

**Liste** · `terrain.bordereau.voir` · `GET bordereaux` · filtres : `statut`, `depot_id`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_envoi`, `depot_id`, `nombre_sacs`, `poids_total_kg`, `transporteur`, `cout_transport`, `statut`

**Fiche** · `/terrain/envois/:bordereauId` · `GET bordereaux/{id}`

Renvoie le bordereau, ses `sacs` (avec la pesée et le producteur de chacun) et, une fois reçu, l'entrée au dépôt et son écart.

#### TE-08 · Préparer un bordereau d'envoi

- **Permission** : `terrain.bordereau.saisir`
- **Où** : bouton « Nouveau bordereau » de la liste · formulaire en page
- **État** (`bordereaux.statut`) : (création) → `prepare`
- **Avant la saisie** : `GET sacs?disponibles=1` — sacs des pesées validées de ma zone, pas encore envoyés ; `GET depots` — dépôts actifs
- **Envoi** : `POST bordereaux`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Dépôt de destination | `depot_id` | sélecteur → `depots` | oui | un seul dépôt actif : prérempli |
| (campagne choisie) | `campagne_id` | aucun champ | oui | pris dans `ContexteService` |
| Date d'envoi | `date_envoi` | date | oui | défaut : aujourd'hui |
| Sacs à envoyer | `sac_ids` | tableau d'identifiants de `sacs` | oui | cases à cocher, regroupées par pesée ; au moins un |
| Transporteur | `transporteur` | texte (100) | — | — |
| Immatriculation | `immatriculation` | texte (20) | — | — |
| Coût du transport | `cout_transport` | montant | — | montant convenu ; 0 si le transport est interne |

**Rempli par le serveur** : `numero`, `superviseur_id`, `produit_id`, `nombre_sacs`, `poids_total_kg`.

```json
{
  "depot_id": 1, "campagne_id": 1, "date_envoi": "2026-05-25", "sac_ids": [1, 2, 3, 4, 5],
  "transporteur": "[TRANSPORTEUR]", "immatriculation": "RC-0000-A", "cout_transport": "450000.00"
}
```

- **Le serveur** : rattache les sacs (`sacs.bordereau_id`), compte `nombre_sacs` et additionne `poids_total_kg`.
- **Refus** :
  - `SAC_DEJA_ENVOYE` — Un sac figure déjà sur un autre bordereau : `details` donne les sacs en cause.
- **Aussi** :
  - Modifier un bordereau préparé : `PUT bordereaux/{id}` — tant que `statut` = `prepare` ; `sac_ids` remplace la liste

#### TE-09 · Envoyer le bordereau

- **Permission** : `terrain.bordereau.saisir`
- **Où** : bouton « Envoyer au dépôt » de la fiche (statut `prepare`) · confirmation (`default-confirm`)
- **État** (`bordereaux.statut`) : `prepare` → `envoye`
- **Envoi** : `POST bordereaux/{id}/envoyer`
- **Le serveur** :
  - verrouille le bordereau et émet son PDF (`documents_emis`, type `bordereau`) à remettre au transporteur ;
  - le dépôt le voit aussitôt dans Dépôts → Entrées (compteur « bordereaux attendus »).
- **Ensuite** : proposer « Imprimer le bordereau » ; rafraîchir le compteur `envois`.

### 7.9 Rapports — `/terrain/rapports`

**Lecture** · `terrain.rapport.voir` · `GET collecte/villages` · `GET collecte/zones`

Lecture seule : collecte par village et par zone (`v_collecte_villages`, `v_collecte_zones`), comparée aux objectifs. Export par CO-22 pour qui en a le droit.

---

## 8. Dépôts et traitement

`depots/` · préfixe `de` · espace : Traitement et transformation · 11 pages, 10 actions · application à ouvrir (`status: 'soon'`)

L'application du responsable de traitement. Le serveur limite chaque liste à son dépôt ; `depot_id` est prérempli et verrouillé quand l'utilisateur n'a qu'un dépôt.

Trois règles tiennent tous les formulaires : **pas d'entrée sans bordereau**, **pas de sortie sans lot de vente**, et **le stock ne se saisit jamais** — il se lit dans `mouvements_stock`, que seules les actions ci-dessous alimentent.

### 8.1 Entrées — `/depots/entrees`

**Liste** · `depots.entree.voir` · `GET entrees-depot` · `GET bordereaux?statut=envoye` · filtres : `depot_id`, `statut`, `est_hors_seuil`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_entree`, `bordereau_id`, `poids_bordereau_kg`, `poids_recu_kg`, `ecart_kg`, `ecart_pct`, `humidite_pct`, `statut`

Deux blocs : en haut les bordereaux **attendus** (envoyés par le terrain, pas encore reçus), avec le bouton « Recevoir » ; en dessous les entrées déjà enregistrées.

**Fiche** · `/depots/entrees/:entreeId` · `GET entrees-depot/{id}`

Renvoie l'entrée, le bordereau, ses sacs et, une fois validée, le lot et les apports par producteur (`lot_apports`).

#### DE-01 · Recevoir un bordereau

- **Permission** : `depots.entree.saisir`
- **Où** : bouton « Recevoir » sur un bordereau attendu · formulaire en dialogue
- **État** (`entrees_depot.statut`) : (création) → `recue`
- **Avant la saisie** : `GET entrees-depot/preparation?bordereau_id=1` — poids annoncé, nombre de sacs, `seuil_ecart_pct` en vigueur (paramètre `ECART_POIDS_SEUIL_PCT`)
- **Envoi** : `POST entrees-depot`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Bordereau | `bordereau_id` | sélecteur → `bordereaux` | oui | prérempli et verrouillé : une seule entrée par bordereau |
| Date et heure de réception | `date_entree` | date et heure | oui | défaut : maintenant |
| Poids repesé | `poids_recu_kg` | poids en kg | oui | supérieur à 0 ; l'écart avec le poids annoncé s'affiche pendant la saisie |
| Humidité à l'arrivée | `humidite_pct` | pourcentage | oui | entre 0 et 100 |

**Rempli par le serveur** : `numero`, `depot_id`, `poids_bordereau_kg`, `ecart_kg`, `ecart_pct`, `recu_par`.

```json
{
  "bordereau_id": 1, "date_entree": "2026-05-26 08:00:00", "poids_recu_kg": "1496.000",
  "humidite_pct": "14.00"
}
```

Réponse (extrait) :

```json
{ "id": 1, "numero": "ED-2026-000001", "poids_bordereau_kg": "1500.000", "poids_recu_kg": "1496.000",
  "ecart_kg": "-4.000", "ecart_pct": "-0.27", "est_hors_seuil": false, "statut": "recue" }
```

- **Le serveur** :
  - copie le poids annoncé, calcule `ecart_kg` et `ecart_pct`, pose `est_hors_seuil` si l'écart dépasse le seuil ;
  - passe le bordereau à `recu`, ou à `recu_avec_ecart` avec une alerte `ecart_poids` pour le superviseur et le gérant.
- **Refus** :
  - `BORDEREAU_DEJA_RECU` — Une entrée existe déjà pour ce bordereau.
  - `BORDEREAU_NON_ENVOYE` — Le bordereau est encore `prepare` : le terrain ne l'a pas envoyé.
  - `DEPOT_HORS_PERIMETRE` (403) — Le bordereau est destiné à un autre dépôt.
- **Ensuite** : ouvrir la fiche de l'entrée pour la valider (DE-02) ; rafraîchir le compteur `entrees`.

> Aperçu de l'écart avec `ecartReception` de `chaine.util.ts`. Sékou Camara : 1 496 − 1 500 = −4 kg, soit −0,27 %.

#### DE-02 · Valider l'entrée et ranger les sacs dans un lot

- **Permission** : `depots.entree.saisir`
- **Où** : bouton « Valider et ranger » de la fiche de l'entrée · formulaire en dialogue
- **État** : `entrees_depot.statut` `recue` ou `contestee` → `validee` (Valider) · `lots.statut` (création) → `en_traitement` (Ouvrir un lot)
- **Avant la saisie** : `GET lots?statut=en_traitement&depot_id=1` — lots ouverts du même produit et de la même campagne
- **Envoi** : `POST entrees-depot/{id}/valider`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Lot | `lot_id` | sélecteur → `lots` | — | un lot ouvert, ou « Nouveau lot » (valeur `null`) |

```json
{
  "lot_id": null
}
```

Réponse (extrait) :

```json
{ "id": 1, "statut": "validee", "lot": { "id": 1, "code": "KOL-2026-012", "poids_entree_kg": "1496.000", "cout_achat": "9000000.00" } }
```

- **Le serveur** :
  - ouvre le lot si besoin (`lots.code` attribué, `date_ouverture`) et y range les sacs (`sacs.lot_id`) ;
  - écrit une ligne `lot_apports` par pesée : kilos du champ, kilos reçus (l'écart est réparti au prorata), montant d'achat ;
  - ajoute au lot `poids_entree_kg`, `poids_actuel_kg` et `cout_achat` ; écrit le mouvement `entree_collecte` dans `mouvements_stock` et les coûts d'achat dans `lot_couts`.
- **Refus** :
  - `LOT_INCOMPATIBLE` — Le lot choisi est d'un autre produit, d'une autre campagne, d'un autre dépôt, ou n'est plus `en_traitement`.
- **Ensuite** : ouvrir le lot.
- **Aussi** :
  - Contester l'entrée : `POST entrees-depot/{id}/contester` — corps `{ "motif": "…" }` ; `recue` → `contestee` : l'écart est refusé en l'état, le stock n'est pas créé, l'alerte reste ouverte jusqu'à l'accord

### 8.2 Lots au dépôt — `/depots/lots`

**Liste** · `depots.lot.voir` · `GET lots` · filtres : `recherche`, `depot_id`, `statut`

**Colonnes de la liste** : `code`, `depot_id`, `date_ouverture`, `poids_entree_kg`, `poids_actuel_kg`, `humidite_actuelle_pct`, `cout_achat`, `statut`

Ligne de total sur les poids. La perte du lot (`pertePct`) s'affiche à côté du poids du jour, en rouge au-dessus de la norme.

**Fiche** · `/depots/lots/:lotId` · `GET lots/{id}`

Onglets Apports (`lot_apports`), Traitement (`traitements`), Mesures (`mesures_lot`), Valeur (`lot_couts`), Mouvements (`mouvements_stock`). Un lot `bloque` affiche `motif_blocage` dans un bandeau rouge.

#### DE-03 · Justifier un lot bloqué

- **Permission** : `depots.lot.justifier`
- **Où** : bandeau rouge de la fiche d'un lot `bloque` · formulaire en dialogue
- **Envoi** : `POST lots/{id}/justifier`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Justification | `justification` | texte long | oui | pourquoi la perte dépasse le seuil : pluie, tri sévère, sacs percés… ; 20 caractères au moins |

```json
{
  "justification": "Pluie pendant le séchage du 2 au 4 juin, deuxième passage nécessaire"
}
```

- **Le serveur** :
  - enregistre la justification et crée une ligne `approbations` (type `deblocage_lot`, décision `en_attente`) pour le gérant ;
  - le lot reste `bloque` : aucune sortie possible tant que le gérant n'a pas décidé (PI-03).
- **Refus** :
  - `DEMANDE_DEJA_EN_ATTENTE` — Une demande de déblocage attend déjà la décision du gérant.
- **Ensuite** : bandeau « En attente de la décision du gérant ».

### 8.3 Traitement — `/depots/traitement`

**Lecture** · `depots.traitement.voir` · `GET traitements` · filtres : `lot_id`, `produit_etape_id`, `statut`, `du`, `au`

**Colonnes de la liste** : `lot_id`, `produit_etape_id`, `date_debut`, `date_fin`, `poids_avant_kg`, `poids_apres_kg`, `perte_kg`, `perte_pct`, `statut`

Vue par lot : pour chaque lot `en_traitement`, ses étapes dans l'ordre de `produit_etapes`, faites, en cours ou à venir.

#### DE-04 · Démarrer une étape de traitement

- **Permission** : `depots.traitement.saisir`
- **Où** : bouton « Démarrer » sur la prochaine étape d'un lot · formulaire en dialogue
- **État** (`traitements.statut`) : (création) → `en_cours`
- **Avant la saisie** : `GET produits/{id}/etapes` — étapes du produit, dans l'ordre
- **Envoi** : `POST traitements`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Lot | `lot_id` | sélecteur → `lots` | oui | prérempli |
| Étape | `produit_etape_id` | sélecteur → `produit_etapes` | oui | préremplie : la prochaine étape non faite |
| Début | `date_debut` | date | oui | défaut : aujourd'hui |
| Poids avant | `poids_avant_kg` | poids en kg | oui | prérempli avec `lots.poids_actuel_kg`, en lecture seule |
| Humidité avant | `humidite_avant_pct` | pourcentage | — | préremplie avec `lots.humidite_actuelle_pct` |
| Observations | `observations` | texte long | — | — |

**Rempli par le serveur** : `operateur_id`.

```json
{
  "lot_id": 1, "produit_etape_id": 1, "date_debut": "2026-05-26", "poids_avant_kg": "1496.000",
  "humidite_avant_pct": "14.00", "observations": null
}
```

- **Refus** :
  - `ETAPE_PRECEDENTE_NON_TERMINEE` — Les étapes se font dans l'ordre.
  - `ETAPE_DEJA_FAITE` — Cette étape existe déjà pour ce lot.
  - `LOT_NON_EN_TRAITEMENT` — Le lot est `bloque`, `pret_a_vendre` ou `vendu`.

#### DE-05 · Terminer une étape de traitement

- **Permission** : `depots.traitement.saisir`
- **Où** : bouton « Terminer » sur l'étape en cours · formulaire en dialogue
- **État** (`traitements.statut`) : `en_cours` → `termine`
- **Avant la saisie** : `GET regles-en-vigueur?produit_id=1` — `perte_norme_min`, `perte_norme_max`, `perte_seuil_blocage`, `humidite_vente`
- **Envoi** : `POST traitements/{id}/terminer`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Fin | `date_fin` | date | oui | défaut : aujourd'hui ; pas avant le début |
| Poids après | `poids_apres_kg` | poids en kg | oui | inférieur ou égal au poids avant ; la perte s'affiche pendant la saisie |
| Humidité après | `humidite_apres_pct` | pourcentage | — | — |
| Observations | `observations` | texte long | — | — |

```json
{
  "date_fin": "2026-06-05", "poids_apres_kg": "1410.000", "humidite_apres_pct": "9.00",
  "observations": null
}
```

Réponse (extrait) :

```json
{ "id": 1, "perte_kg": "86.000", "perte_pct": "5.75", "statut": "termine", "lot": { "id": 1, "poids_actuel_kg": "1410.000", "statut": "en_traitement" } }
```

- **Le serveur** :
  - calcule `perte_kg` et `perte_pct`, écrit le mouvement `perte_traitement` dans `mouvements_stock` et un relevé dans `mesures_lot` ;
  - met à jour `lots.poids_actuel_kg` et `lots.humidite_actuelle_pct` ;
  - perte du lot au-dessus du seuil : lot `bloque`, `motif_blocage` rempli, alerte `perte_anormale` ; sinon, après la dernière étape obligatoire, lot `pret_a_vendre`.
- **Ensuite** : si la réponse renvoie un lot `bloque`, ouvrir aussitôt le dialogue de justification (DE-03).

> Aperçu avec `pertePct`. Sékou Camara, sur les deux étapes : (1 496 − 1 395) ÷ 1 496 = 6,8 %.

#### DE-06 · Relever une mesure

- **Permission** : `depots.mesure.saisir`
- **Où** : bouton « Relever » de l'onglet Mesures d'un lot · formulaire en dialogue
- **Envoi** : `POST mesures-lot`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Lot | `lot_id` | sélecteur → `lots` | oui | prérempli |
| Date | `date_mesure` | date | oui | défaut : aujourd'hui |
| Humidité | `humidite_pct` | pourcentage | oui | entre 0 et 100 |
| Poids constaté | `poids_kg` | poids en kg | — | facultatif : simple relevé, il ne change pas le stock |

**Rempli par le serveur** : `mesure_par`.

```json
{
  "lot_id": 1, "date_mesure": "2026-06-02", "humidite_pct": "11.50", "poids_kg": null
}
```

- **Le serveur** : met à jour `lots.humidite_actuelle_pct` ; le poids du stock ne change que par une fin d'étape, une sortie ou un inventaire.
- **Ensuite** : la courbe d'humidité de l'onglet se complète.

### 8.4 Valeur avant et après — `/depots/valeur`

**Lecture** · `depots.valeur.voir` · `GET lots` · `GET lot-couts` · filtres : `lot_id`, `nature`

Lecture seule. Pour chaque lot : coût d'achat (`lots.cout_achat`), coûts ajoutés par nature (`lot_couts`), valeur totale et coût au kilo du jour. Chaque coût mène à son opération d'origine (`origine_table`, `origine_id`).

### 8.5 Sorties — `/depots/sorties`

**Lecture** · `depots.sortie.voir` · `GET sorties-depot` · `GET lots-vente?statut=pret` · filtres : `lot_id`, `lot_vente_id`, `depot_id`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_sortie`, `lot_id`, `lot_vente_id`, `poids_sortie_kg`, `humidite_pct`

En haut, les lots de vente `pret` dont un lot de ce dépôt reste à sortir, avec le bouton « Sortir » ; en dessous, les sorties faites.

#### DE-07 · Enregistrer une sortie

- **Permission** : `depots.sortie.saisir`
- **Où** : bouton « Sortir » sur un lot de vente à sortir · formulaire en dialogue
- **État** (`lots.statut`) : `pret_a_vendre` → `vendu`
- **Avant la saisie** : `GET lots-vente/{id}` — composition : les lots du dépôt à sortir et leurs kilos
- **Envoi** : `POST sorties-depot`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Lot de vente | `lot_vente_id` | sélecteur → `lots_vente` | oui | prérempli et verrouillé : pas de sortie sans lot de vente |
| Lot du dépôt | `lot_id` | sélecteur → `lots` | oui | limité aux lots de la composition |
| Date et heure de sortie | `date_sortie` | date et heure | oui | défaut : maintenant |
| Poids de sortie | `poids_sortie_kg` | poids en kg | oui | pesée de sortie ; inférieur ou égal à `lots.poids_actuel_kg` |
| Humidité | `humidite_pct` | pourcentage | — | — |

**Rempli par le serveur** : `numero`, `depot_id`, `sorti_par`.

```json
{
  "lot_vente_id": 1, "lot_id": 1, "date_sortie": "2026-06-18 09:00:00", "poids_sortie_kg": "1395.000",
  "humidite_pct": "9.00"
}
```

- **Le serveur** :
  - écrit le mouvement `sortie_vente` dans `mouvements_stock`, diminue `lots.poids_actuel_kg` ; le lot passe à `vendu` quand il est vide ;
  - ajoute le poids à `lots_vente.poids_sortie_kg` : c'est ce poids, pas le poids prévu, que le contrat et la facture reprennent.
- **Refus** :
  - `LOT_BLOQUE` — Le lot est `bloque` : justification et décision du gérant d'abord.
  - `LOT_HORS_COMPOSITION` — Ce lot ne fait pas partie du lot de vente.
  - `LOT_VENTE_NON_PRET` — Le lot de vente est encore `en_composition`.
  - `POIDS_SUPERIEUR_AU_STOCK` — Le poids de sortie dépasse le poids du lot : `details` donne le stock.
- **Ensuite** : rafraîchir le compteur `sorties`.

### 8.6 Stock et mouvements — `/depots/stock`

**Lecture** · `depots.stock.voir` · `GET mouvements-stock` · `GET stock/depots` · `GET stock/lots` · filtres : `depot_id`, `lot_id`, `type_mouvement`, `sens`, `du`, `au`

**Colonnes de la liste** : `date_mouvement`, `lot_id`, `type_mouvement`, `sens`, `poids_kg`, `valeur`, `origine_table`, `origine_id`

Lecture seule : aucun formulaire. Le stock par dépôt et par lot vient des vues `v_stock_depots` et `v_stock_lots` ; chaque mouvement mène à son opération d'origine. Une erreur de stock se corrige par un inventaire (DE-10), jamais par une saisie directe.

### 8.7 Inventaires — `/depots/inventaires`

**Liste** · `depots.inventaire.voir` · `GET inventaires` · filtres : `depot_id`, `statut`, `exercice_id`

**Colonnes de la liste** : `numero`, `date_inventaire`, `depot_id`, `exercice_id`, `statut`

**Fiche** · `/depots/inventaires/:inventaireId` · `GET inventaires/{id}`

Renvoie l'inventaire et ses lignes : une par lot en stock, avec le poids théorique, le poids compté, l'écart et la valeur.

#### DE-08 · Ouvrir un inventaire

- **Permission** : `depots.inventaire.saisir`
- **Où** : bouton « Nouvel inventaire » de la liste · formulaire en dialogue
- **État** (`inventaires.statut`) : (création) → `en_cours`
- **Envoi** : `POST inventaires`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Dépôt | `depot_id` | sélecteur → `depots` | oui | — |
| Date | `date_inventaire` | date | oui | défaut : aujourd'hui |
| Inventaire de clôture de l'exercice | `exercice_id` | sélecteur → `exercices` | — | à choisir seulement pour l'inventaire de fin d'exercice |

**Rempli par le serveur** : `numero`.

```json
{
  "depot_id": 1, "date_inventaire": "2026-12-31", "exercice_id": 1
}
```

- **Le serveur** : prépare une ligne `inventaire_lignes` par lot en stock, avec son `poids_theorique_kg` du moment.
- **Refus** :
  - `INVENTAIRE_DEJA_OUVERT` — Un inventaire `en_cours` existe déjà pour ce dépôt.
- **Ensuite** : ouvrir la fiche pour saisir les poids comptés.

#### DE-09 · Saisir les poids comptés

- **Permission** : `depots.inventaire.saisir`
- **Où** : tableau de la fiche d'un inventaire `en_cours` : une cellule de saisie par lot · formulaire en page
- **Envoi** : `PUT inventaires/{id}`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Lot | `lignes[].lot_id` | sélecteur → `lots` | oui | en lecture seule |
| Poids compté | `lignes[].poids_compte_kg` | poids en kg | oui | 0 si le lot est introuvable |
| Justification | `lignes[].justification` | texte (255) | — | obligatoire dès qu'il y a un écart |

```json
{
  "lignes": [
    { "lot_id": 1, "poids_compte_kg": "1393.500", "justification": "Sac percé, perte au sol" }
  ]
}
```

- **Le serveur** : calcule pour chaque ligne `ecart_kg`, `cout_kg` et `valeur` ; rien ne touche encore au stock.
- **Ensuite** : enregistrement possible en plusieurs fois (bouton « Enregistrer le comptage »), la validation vient après.

#### DE-10 · Valider un inventaire

- **Permission** : `depots.inventaire.valider`
- **Où** : bouton « Valider l'inventaire » de la fiche · confirmation (`default-confirm`)
- **État** (`inventaires.statut`) : `en_cours` → `valide`
- **Envoi** : `POST inventaires/{id}/valider`
- **Le serveur** :
  - renseigne `valide_par` ; pour chaque écart, écrit un mouvement `ajustement_inventaire` dans `mouvements_stock` et corrige `lots.poids_actuel_kg` ;
  - inventaire de clôture (`exercice_id` renseigné) : passe les écritures de stock de fin d'exercice.
- **Refus** :
  - `COMPTAGE_INCOMPLET` — Des lots n'ont pas de poids compté.
  - `JUSTIFICATION_REQUISE` — Un écart n'est pas justifié : `details` donne les lots.
- **Ensuite** : l'inventaire passe en lecture seule.

### 8.8 Rapports — `/depots/rapports`

**Lecture** · `depots.rapport.voir` · `GET stock/depots` · `GET traitements`

Lecture seule : stock par dépôt et par produit, pertes par étape comparées à la norme (`produit_regles`).

---

## 9. Ventes et import-export

`ventes/` · préfixe `ve` · espace : Ventes et marges · Import-export · 18 pages, 16 actions · application à ouvrir (`status: 'soon'`)

Une application pour deux espaces : les ventes (clients, lots de vente, contrats, factures, marges) et l'import-export (dossiers, documents, expéditions). Chacun ne voit que ses entrées de menu.

L'argent ne se saisit pas ici : **l'encaissement d'une facture et le règlement d'un frais se font en Comptabilité**. Ici, on lit ce qui a été payé et ce qui reste dû.

Une vente en devise porte le taux du jour, **copié par le serveur** : le formulaire l'affiche avec le montant converti en GNF, il ne le saisit pas.

### 9.1 Clients — `/ventes/clients`

**Liste** · `ventes.client.voir` · `GET clients` · filtres : `recherche`, `pays`, `est_export`, `statut`

**Colonnes de la liste** : `code`, `raison_sociale`, `pays`, `ville`, `contact_nom`, `telephone`, `est_export`, `devise_id`, `statut`

**Fiche** · `/ventes/clients/:clientId` · `GET clients/{id}`

Coordonnées et conditions, puis l'encours (factures émises non payées) et la liste de ses ventes.

#### VE-01 · Créer un client

- **Permission** : `ventes.client.saisir`
- **Où** : bouton « Nouveau client » de la liste · formulaire en dialogue
- **État** (`clients.statut`) : (création) → `actif`
- **Envoi** : `POST clients`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Raison sociale | `raison_sociale` | texte (150) | oui | — |
| Pays | `pays` | texte (60) | oui | défaut : Guinée |
| Ville | `ville` | texte (80) | — | — |
| Personne à contacter | `contact_nom` | texte (100) | — | — |
| Téléphone | `telephone` | téléphone (20) | — | avec l'indicatif du pays |
| Courriel | `email` | courriel (150) | — | — |
| Client à l'étranger | `est_export` | case à cocher | — | cochée : chaque vente confirmée ouvre un dossier d'export |
| Devise habituelle | `devise_id` | sélecteur → `devises` | — | proposée dans ses contrats ; défaut : GNF, ou USD si la case précédente est cochée |
| Délai de paiement | `delai_paiement_jours` | entier | — | en jours ; sert à proposer l'échéance d'un contrat |
| Conditions | `conditions` | texte (255) | — | — |

**Rempli par le serveur** : `code`.

```json
{
  "raison_sociale": "[ACHETEUR À L'ÉTRANGER]", "pays": "[PAYS]", "ville": null, "contact_nom": null,
  "telephone": null, "email": null, "est_export": true, "devise_id": 2, "delai_paiement_jours": 15,
  "conditions": null
}
```

- **Le serveur** : attribue le `code` (`CL-0001`) et crée le compte du client dans `tiers` (type `client`).
- **Aussi** :
  - Modifier : `PUT clients/{id}` — mêmes champs
  - Suspendre : `POST clients/{id}/suspendre` — corps `{ "motif": "…" }` ; plus de nouveau contrat avec ce client
  - Réactiver : `POST clients/{id}/reactiver`
  - Désactiver : `POST clients/{id}/desactiver` — la fiche disparaît des sélecteurs ; refusé s'il reste une facture à encaisser

### 9.2 Lots de vente — `/ventes/lots-vente`

**Liste** · `ventes.lot-vente.voir` · `GET lots-vente` · filtres : `recherche`, `statut`

**Colonnes de la liste** : `code`, `qualite`, `poids_prevu_kg`, `poids_sortie_kg`, `cout_revient`, `statut`

**Fiche** · `/ventes/lots-vente/:lotVenteId` · `GET lots-vente/{id}`

Renvoie le lot de vente, sa composition (`lot_vente_compositions`), les producteurs d'origine (par `lot_apports`) et son coût de revient détaillé (`lot_couts`).

#### VE-02 · Composer un lot de vente

- **Permission** : `ventes.lot-vente.saisir`
- **Où** : bouton « Nouveau lot de vente » de la liste · formulaire en page
- **État** (`lots_vente.statut`) : (création) → `en_composition`
- **Avant la saisie** : `GET lots?statut=pret_a_vendre&disponibles=1` — lots du dépôt prêts et pas encore composés
- **Envoi** : `POST lots-vente`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| (campagne choisie) | `campagne_id` | aucun champ | oui | pris dans `ContexteService` |
| Qualité | `qualite` | texte (50) | — | texte libre : « Cajou brut séché » |
| Poids prévu | `poids_prevu_kg` | poids en kg | oui | proposé : somme des kilos de la composition |
| Lot du dépôt | `compositions[].lot_id` | sélecteur → `lots` | oui | un lot du dépôt ne se vend qu'une fois : les lots déjà composés ne sont pas proposés |
| Kilos pris | `compositions[].poids_kg` | poids en kg | oui | proposé : `lots.poids_actuel_kg` |

**Rempli par le serveur** : `code`, `produit_id`.

```json
{
  "campagne_id": 1, "qualite": "Cajou brut séché", "poids_prevu_kg": "1395.000",
  "compositions": [{ "lot_id": 1, "poids_kg": "1395.000" }]
}
```

- **Le serveur** :
  - attribue le `code` (`BK-2026-07`) et écrit `lot_vente_compositions` ;
  - le coût de revient (`lots_vente.cout_revient`) se calcule tout seul : coûts des lots composés, plus les coûts propres du lot de vente.
- **Refus** :
  - `LOT_DEJA_COMPOSE` — Un lot figure déjà dans un autre lot de vente.
  - `LOT_NON_PRET` — Un lot n'est pas `pret_a_vendre` (en traitement ou bloqué).
- **Aussi** :
  - Modifier la composition : `PUT lots-vente/{id}` — tant que `statut` = `en_composition` ; `compositions` remplace la liste

#### VE-03 · Déclarer le lot de vente prêt

- **Permission** : `ventes.lot-vente.saisir`
- **Où** : bouton « Prêt » de la fiche (statut `en_composition`) · confirmation (`default-confirm`)
- **État** (`lots_vente.statut`) : `en_composition` → `pret`
- **Envoi** : `POST lots-vente/{id}/declarer-pret`
- **Le serveur** : fige la composition ; le dépôt voit le lot dans Dépôts → Sorties, et le lot devient proposable dans un contrat.
- **Refus** :
  - `COMPOSITION_VIDE` — Aucun lot du dépôt dans la composition.

### 9.3 Contrats et prix — `/ventes/contrats`

**Liste** · `ventes.contrat.voir` · `GET ventes` · filtres : `recherche`, `client_id`, `statut`, `devise_id`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_vente`, `client_id`, `lot_vente_id`, `poids_kg`, `prix_unitaire`, `unite_prix`, `devise_id`, `montant_devise`, `montant_gnf`, `date_echeance`, `statut`

Ligne de total sur le poids et sur le montant en GNF (jamais sur le montant en devise : les devises ne s'additionnent pas).

**Fiche** · `/ventes/contrats/:venteId` · `GET ventes/{id}`

Renvoie le contrat, le client, le lot de vente, la facture et le dossier d'export s'ils existent, et ce qui est encaissé.

#### VE-04 · Préparer un contrat de vente

- **Permission** : `ventes.contrat.saisir`
- **Où** : bouton « Nouveau contrat » de la liste, ou « Vendre ce lot » sur un lot de vente `pret` · formulaire en page
- **État** (`ventes.statut`) : (création) → `brouillon`
- **Avant la saisie** : `GET clients?recherche=…` — client ; `GET lots-vente?statut=pret` — lots de vente à vendre ; `GET ventes/preparation?lot_vente_id=1&devise_id=2&date_vente=2026-06-20` — poids du lot, `cout_revient`, `taux_change` et `date_taux` du jour
- **Envoi** : `POST ventes`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Lot de vente | `lot_vente_id` | sélecteur → `lots_vente` | oui | un lot de vente ne porte qu'un contrat actif |
| Client | `client_id` | sélecteur → `clients` | oui | — |
| Date du contrat | `date_vente` | date | oui | défaut : aujourd'hui |
| Poids vendu | `poids_kg` | poids en kg | oui | prérempli : poids sorti du dépôt, à défaut poids prévu |
| Prix | `prix_unitaire` | prix (4 déc.) | oui | supérieur à 0, dans la devise choisie |
| Prix donné | `unite_prix` | liste : `kg` · `tonne` | — | boutons radio |
| Devise | `devise_id` | sélecteur → `devises` | oui | préremplie avec celle du client ; change le taux affiché |
| Incoterm | `incoterm` | texte (10) | — | `FOB`, `CIF`… ; affiché seulement pour un client à l'étranger |
| Lieu de livraison | `lieu_livraison` | texte (100) | — | — |
| Livraison prévue | `date_livraison_prevue` | date | — | — |
| Échéance de paiement | `date_echeance` | date | — | proposée : date du contrat + `clients.delai_paiement_jours` |

**Rempli par le serveur** : `numero`, `taux_change`, `date_taux`, `montant_devise`, `montant_gnf`, `vendeur_id`.

```json
{
  "lot_vente_id": 1, "client_id": 1, "date_vente": "2026-06-20", "poids_kg": "1395.000",
  "prix_unitaire": "1350.0000", "unite_prix": "tonne", "devise_id": 2, "incoterm": "FOB",
  "lieu_livraison": "Conakry", "date_livraison_prevue": null, "date_echeance": "2026-07-05"
}
```

Réponse (extrait) :

```json
{ "id": 1, "numero": "VT-2026-000001", "taux_change": "8700.000000", "date_taux": "2026-06-20",
  "montant_devise": "1883.25", "montant_gnf": "16384275.00", "statut": "brouillon" }
```

- **Le serveur** :
  - copie le taux de change de la date du contrat (`taux_change`, `date_taux`) ; calcule `montant_devise` et `montant_gnf` ;
  - une vente en GNF porte un taux de 1.
- **Refus** :
  - `TAUX_ABSENT` — Pas de taux saisi pour cette devise à cette date : le faire saisir dans Administration → Devises.
  - `LOT_VENTE_DEJA_VENDU` — Un contrat non annulé existe déjà pour ce lot de vente.
  - `CLIENT_SUSPENDU` — Le client est `suspendu`.
- **Aussi** :
  - Modifier un contrat en brouillon : `PUT ventes/{id}` — tant que `statut` = `brouillon` ; le serveur recopie le taux si la date ou la devise change

> Aperçu avec `montantVente` et `enGnf`, plus la marge prévue avec `marge` et le `cout_revient` de la préparation. Sékou Camara : 1 395 kg à 1 350 USD la tonne = 1 883,25 USD, soit 16 384 275 GNF au taux de 8 700.

#### VE-05 · Confirmer un contrat

- **Permission** : `ventes.contrat.confirmer`
- **Où** : bouton « Confirmer » de la fiche (statut `brouillon`) · confirmation (`default-confirm`)
- **État** (`ventes.statut`) : `brouillon` → `confirmee`
- **Envoi** : `POST ventes/{id}/confirmer`
- **Le serveur** :
  - verrouille le contrat ; passe le lot de vente à `vendu` ;
  - client à l'étranger (`clients.est_export`) : ouvre le dossier d'export `en_preparation` et y inscrit un document `attendu` par type obligatoire (`types_documents`, sens `export`).
- **Refus** :
  - `LOT_VENTE_NON_PRET` — Le lot de vente est encore `en_composition`.
  - `LOT_VENTE_DEJA_VENDU` — Un autre contrat a été confirmé entre-temps sur ce lot.
- **Ensuite** : proposer « Préparer la facture » (VE-06) ; pour un client à l'étranger, lien vers le dossier ouvert.
- **Aussi** :
  - Marquer une vente locale livrée : `POST ventes/{id}/livrer` — `confirmee` → `livree` ; pour un client à l'étranger, c'est la livraison du dossier d'export qui le fait
  - Annuler un contrat : `POST ventes/{id}/annuler` — corps `{ "motif": "…" }` ; `brouillon` ou `confirmee` → `annulee`, le lot de vente redevient `pret` ; refusé si une facture est émise (l'annuler d'abord par un avoir)

### 9.4 Factures — `/ventes/factures`

**Liste** · `ventes.facture.voir` · `GET factures` · filtres : `recherche`, `client_id`, `statut`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_facture`, `client_id`, `vente_id`, `total_ht`, `total_taxe`, `total_ttc`, `total_gnf`, `statut`

**Fiche** · `/ventes/factures/:factureId` · `GET factures/{id}`

Renvoie la facture, ses lignes (`facture_lignes`), ses encaissements et, s'il existe, l'avoir qui l'annule.

#### VE-06 · Préparer une facture

- **Permission** : `ventes.facture.emettre`
- **Où** : bouton « Préparer la facture » d'un contrat `confirmee` · formulaire en page
- **État** (`factures.statut`) : (création) → `brouillon`
- **Avant la saisie** : `GET factures/preparation?vente_id=1` — lignes proposées à partir du contrat, devise et taux du contrat
- **Envoi** : `POST factures`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Contrat | `vente_id` | sélecteur → `ventes` | oui | prérempli et verrouillé |
| Date de la facture | `date_facture` | date | oui | défaut : aujourd'hui |
| Désignation | `lignes[].designation` | texte (200) | oui | proposée : produit, qualité et code du lot de vente |
| Quantité | `lignes[].quantite` | nombre (3 déc.) | oui | proposée : poids du contrat, dans l'unité du prix |
| Unité | `lignes[].unite` | texte (10) | oui | `kg` ou `tonne` |
| Prix unitaire | `lignes[].prix_unitaire` | prix (4 déc.) | oui | proposé : prix du contrat |
| Taxe | `lignes[].taxe_id` | sélecteur → `taxes` | — | vide à l'export |

**Rempli par le serveur** : `numero`, `client_id`, `devise_id`, `taux_change`, `total_ht`, `total_ttc`, `total_gnf`.

```json
{
  "vente_id": 1, "date_facture": "2026-06-20",
  "lignes": [
    { "designation": "Noix de cajou brutes séchées, lot BK-2026-07", "quantite": "1.395", "unite": "tonne", "prix_unitaire": "1350.0000", "taxe_id": null }
  ]
}
```

- **Le serveur** : copie le client, la devise et le taux du contrat ; calcule pour chaque ligne `montant_ht` et `montant_taxe` (taux de la taxe copié), puis les totaux.
- **Refus** :
  - `VENTE_NON_CONFIRMEE` — Le contrat est encore `brouillon` ou a été annulé.
  - `FACTURE_DEJA_EXISTANTE` — Une facture non annulée existe déjà pour ce contrat.
- **Aussi** :
  - Modifier une facture en brouillon : `PUT factures/{id}` — tant que `statut` = `brouillon` ; `lignes` remplace la liste

#### VE-07 · Émettre une facture

- **Permission** : `ventes.facture.emettre`
- **Où** : bouton « Émettre » de la fiche (statut `brouillon`) · confirmation (`default-confirm`)
- **État** (`factures.statut`) : `brouillon` → `emise`
- **Envoi** : `POST factures/{id}/emettre`
- **Le serveur** :
  - verrouille la facture et lui donne son numéro définitif (`FAC-2026-000001`), sans trou dans la suite ;
  - passe l'écriture de vente (`FACTURE_VENTE`) et émet le PDF (`documents_emis`, type `facture`).
- **Refus** :
  - `FACTURE_SANS_LIGNE` — Aucune ligne, ou total à zéro.
  - `PERIODE_CLOTUREE` — La date de la facture tombe dans une période comptable clôturée.
- **Ensuite** : proposer « Imprimer la facture » ; rafraîchir le compteur `factures` ; la facture apparaît en Comptabilité → Encaissements clients.

#### VE-08 · Annuler une facture par un avoir

- **Permission** : `ventes.facture.annuler`
- **Où** : menu « Plus » de la fiche d'une facture `emise` · dialogue de motif (`default-prompt`)
- **État** (`factures.statut`) : `emise` → `annulee`
- **Envoi** : `POST factures/{id}/avoir`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Motif de l'annulation | `motif` | texte (255) | oui | écrit dans `statut_historiques.motif` |

```json
{
  "motif": "Erreur de poids : 1 395 kg facturés au lieu de 1 385 kg"
}
```

- **Le serveur** :
  - crée l'avoir : une facture inverse dont `facture_annulee_id` désigne la facture annulée ; extourne l'écriture de vente ;
  - le contrat reste `confirmee` : une nouvelle facture peut être préparée.
- **Refus** :
  - `FACTURE_ENCAISSEE` — Un encaissement existe : le contre-passer d'abord en Comptabilité (CO-07).
- **Ensuite** : ouvrir l'avoir créé.

### 9.5 Encaissements — `/ventes/encaissements`

**Lecture** · `ventes.encaissement.voir` · `GET encaissements` · `GET factures?statut=emise,payee_partiel` · filtres : `client_id`, `facture_id`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_encaissement`, `facture_id`, `client_id`, `montant_devise`, `taux_change`, `montant_gnf`, `ecart_change_gnf`, `mode_paiement`

**Lecture seule** : ce que chaque client a payé, et les factures échues (`ventes.date_echeance` dépassée) en tête. La saisie se fait en Comptabilité (CO-09).

### 9.6 Coût de revient — `/ventes/cout-revient`

**Lecture** · `ventes.cout.voir` · `GET cout-revient/lots-vente` · `GET lot-couts` · filtres : `lot_vente_id`, `lot_id`, `nature`

Lecture seule, bloc commun `shared/metier/cout-revient/` : pour chaque lot de vente, ses coûts par nature (`achat`, `transport`, `traitement`, `main_oeuvre`, `emballage`, `frais_export`, `autre`), le total et le coût au kilo sec (`v_cout_revient_lots_vente`).

### 9.7 Marges — `/ventes/marges`

**Lecture** · `ventes.marge.voir` · `GET marges`

Lecture seule (`v_marges_lots_vente`) : vente, coût de revient, marge totale et par kilo sec. Sékou Camara : 16 384 275 − 11 720 250 = 4 664 025 GNF, soit 3 343 GNF par kilo sec.

### 9.8 Dossiers d'export — `/ventes/dossiers-export`

**Liste** · `ventes.dossier-export.voir` · `GET dossiers-export` · filtres : `recherche`, `statut`, `est_complet`, `client_id`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_ouverture`, `client_id`, `lot_vente_id`, `pays_destination`, `date_embarquement_prevue`, `est_complet`, `statut`

**Fiche** · `/ventes/dossiers-export/:dossierId` · `GET dossiers-export/{id}`

Trois onglets. **Documents** : une ligne `dossier_documents` par pièce, avec son scan. **Frais** : les `depenses` rattachées au dossier. **Suivi** : dates d'embarquement, d'arrivée et de livraison, et l'historique des statuts. La réponse porte `pieces_manquantes` : les pièces obligatoires qui ne sont pas encore `valide`.

#### VE-09 · Ouvrir ou compléter un dossier d'export

- **Permission** : `ventes.dossier-export.saisir`
- **Où** : ouvert tout seul à la confirmation d'une vente à l'étranger ; sinon bouton « Nouveau dossier » · formulaire en page
- **État** (`dossiers_export.statut`) : (création) → `en_preparation`
- **Avant la saisie** : `GET ventes?statut=confirmee` — ventes sans dossier ; `GET fournisseurs?type=transitaire` — transitaires
- **Envoi** : `POST dossiers-export`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Contrat | `vente_id` | sélecteur → `ventes` | oui | prérempli quand le dossier vient d'un contrat |
| Pays de destination | `pays_destination` | texte (60) | oui | proposé : pays du client |
| Port de départ | `port_depart` | texte (80) | — | proposé : Conakry |
| Port d'arrivée | `port_arrivee` | texte (80) | — | — |
| Transporteur | `transporteur` | texte (120) | — | compagnie maritime |
| Transitaire | `transitaire_id` | sélecteur → `fournisseurs` | — | — |
| Embarquement prévu | `date_embarquement_prevue` | date | — | — |

**Rempli par le serveur** : `numero`, `lot_vente_id`, `client_id`, `date_ouverture`.

```json
{
  "vente_id": 1, "pays_destination": "[PAYS]", "port_depart": "Conakry", "port_arrivee": null,
  "transporteur": null, "transitaire_id": 2, "date_embarquement_prevue": "2026-06-25"
}
```

- **Le serveur** : attribue le `numero` (`EX-2026-000001`) et inscrit les documents obligatoires `attendu`.
- **Refus** :
  - `DOSSIER_DEJA_OUVERT` — Un dossier non annulé existe déjà pour ce contrat.
- **Aussi** :
  - Compléter : `PUT dossiers-export/{id}` — mêmes champs, tant que le dossier est `en_preparation`
  - Annuler un dossier : `POST dossiers-export/{id}/annuler` — corps `{ "motif": "…" }` ; `en_preparation` → `annule`

#### VE-10 · Enregistrer un document reçu

- **Permission** : `ventes.dossier-export.saisir`
- **Où** : onglet Documents du dossier, bouton « Reçu » d'une pièce `attendu` ou `rejete` · formulaire en dialogue
- **État** (`dossier_documents.statut`) : `attendu` ou `rejete` → `recu`
- **Envoi** : `POST dossier-documents/{id}/recevoir`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Numéro du document | `numero_document` | texte (50) | — | — |
| Date du document | `date_document` | date | — | pas dans le futur |

```json
{
  "numero_document": "[NUMÉRO]", "date_document": "2026-06-22"
}
```

- **Ensuite** : joindre aussitôt le scan (SE-07, `table_cible` = `dossier_documents`, `categorie` = `document_dossier`) : une pièce sans scan ne peut pas être validée.
- **Aussi** :
  - Ajouter une pièce non exigée : `POST dossier-documents` — corps `{ "dossier_export_id": 1, "type_document_id": 7 }` (ou `dossier_import_id`) ; la pièce naît `attendu`

> Sur un dossier d'import, la même action demande `ventes.dossier-import.saisir`.

#### VE-11 · Valider ou rejeter un document

- **Permission** : `ventes.document.valider`
- **Où** : onglet Documents, boutons « Valider » et « Rejeter » d'une pièce `recu` · confirmation (`default-confirm`)
- **État** (`dossier_documents.statut`) : `recu` → `valide` (Valider) · `recu` → `rejete` (Rejeter)
- **Envoi** : `POST dossier-documents/{id}/valider`
- **Le serveur** : renseigne `valide_par` ; recalcule `dossiers_export.est_complet` : vrai quand toutes les pièces obligatoires sont `valide`.
- **Refus** :
  - `SCAN_MANQUANT` — Aucune pièce jointe sur ce document.
- **Ensuite** : rafraîchir le compteur `dossiers-export` (dossiers incomplets).
- **Aussi** :
  - Rejeter : `POST dossier-documents/{id}/rejeter` — corps `{ "motif": "…" }` ; la pièce redevient à fournir

#### VE-12 · Ajouter un frais au dossier

- **Permission** : `ventes.frais.saisir`
- **Où** : onglet Frais du dossier, bouton « Ajouter un frais » · formulaire en dialogue
- **Envoi** : `POST depenses`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Dossier | `dossier_export_id` | sélecteur → `dossiers_export` | — | prérempli et verrouillé (`dossier_import_id` sur un dossier d'import) |
| Date | `date_depense` | date | oui | défaut : aujourd'hui |
| Nature | `nature_depense_id` | sélecteur → `natures_depense` | oui | limitée aux natures dont `natures_depense.nature_cout` = `frais_export` : transit, douane… |
| Fournisseur | `fournisseur_id` | sélecteur → `fournisseurs` | — | proposé : le transitaire du dossier |
| Libellé | `libelle` | texte (200) | oui | — |
| Montant | `montant_ht` | montant | oui | — |

- **Le serveur** :
  - même requête et mêmes règles que la saisie d'une dépense (CO-17) ; le serveur déduit `lot_vente_id` et `campagne_id` du dossier ;
  - une fois validé en Comptabilité, le frais entre dans le coût de revient du lot de vente (`lot_couts`, nature `frais_export`).
- **Ensuite** : le frais apparaît dans l'onglet avec son statut ; sa validation et son règlement se font en Comptabilité.

### 9.9 Suivi des expéditions — `/ventes/expeditions`

**Lecture** · `ventes.expedition.voir` · `GET dossiers-export?statut=embarque` · filtres : `statut`, `du`, `au`

**Colonnes de la liste** : `numero`, `client_id`, `pays_destination`, `transporteur`, `numero_connaissement`, `date_embarquement`, `date_arrivee`, `date_livraison`, `statut`

Les dossiers `en_preparation` complets, `embarque` et `arrive`, sur une frise : préparation, embarquement, arrivée, livraison.

#### VE-13 · Suivre une expédition

- **Permission** : `ventes.expedition.saisir`
- **Où** : onglet Suivi du dossier ou page Suivi des expéditions, bouton de l'étape suivante · formulaire en dialogue
- **État** (`dossiers_export.statut`) : `en_preparation` → `embarque` (Embarquer) · `embarque` → `arrive` (Arriver) · `arrive` → `livre` (Livrer)
- **Envoi** : `POST dossiers-export/{id}/embarquer`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date d'embarquement | `date_embarquement` | date | oui | pas dans le futur |
| Numéro du connaissement | `numero_connaissement` | texte (50) | oui | — |
| Transporteur | `transporteur` | texte (120) | — | — |

```json
{
  "date_embarquement": "2026-06-25", "numero_connaissement": "[NUMÉRO]", "transporteur": "[COMPAGNIE]"
}
```

- **Le serveur** : à l'embarquement, le lot de vente passe à `expedie` ; à la livraison, le lot de vente passe à `livre` et la vente à `livree`.
- **Refus** :
  - `DOSSIER_INCOMPLET` — Des pièces obligatoires ne sont pas validées : `details.pieces_manquantes` les nomme. Le bouton « Embarquer » est désactivé tant que `est_complet` est faux.
  - `SORTIE_NON_FAITE` — Le lot de vente n'est pas encore sorti du dépôt.
- **Aussi** :
  - Enregistrer l'arrivée : `POST dossiers-export/{id}/arriver` — corps `{ "date_arrivee": "2026-07-20" }`
  - Enregistrer la livraison : `POST dossiers-export/{id}/livrer` — corps `{ "date_livraison": "2026-07-23" }`

### 9.10 Dossiers d'import — `/ventes/dossiers-import`

**Liste** · `ventes.dossier-import.voir` · `GET dossiers-import` · filtres : `recherche`, `fournisseur_id`, `nature`, `statut`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_commande`, `fournisseur_id`, `nature`, `objet`, `montant_devise`, `montant_gnf`, `cout_rendu_gnf`, `statut`

**Fiche** · `/ventes/dossiers-import/:dossierId` · `GET dossiers-import/{id}`

Commande, documents (`dossier_documents`), frais (`depenses`) et coût rendu : prix d'achat plus frais.

#### VE-14 · Ouvrir un dossier d'import

- **Permission** : `ventes.dossier-import.saisir`
- **Où** : bouton « Nouveau dossier d'import » de la liste · formulaire en page
- **État** (`dossiers_import.statut`) : (création) → `commande`
- **Avant la saisie** : `GET fournisseurs?recherche=…` — fournisseur
- **Envoi** : `POST dossiers-import`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Fournisseur | `fournisseur_id` | sélecteur → `fournisseurs` | oui | — |
| Nature de l'achat | `nature` | liste : `sacs` · `intrants` · `equipement` · `autre` | oui | — |
| Objet | `objet` | texte (200) | oui | « 5 000 sacs de jute » |
| Numéro de commande | `numero_commande` | texte (50) | — | — |
| Date de la commande | `date_commande` | date | oui | défaut : aujourd'hui |
| Devise | `devise_id` | sélecteur → `devises` | oui | — |
| Montant de la commande | `montant_devise` | montant | oui | — |

**Rempli par le serveur** : `numero`, `taux_change`, `montant_gnf`.

```json
{
  "fournisseur_id": 3, "nature": "sacs", "objet": "5 000 sacs de jute", "numero_commande": null,
  "date_commande": "2026-02-10", "devise_id": 2, "montant_devise": "4500.00"
}
```

- **Le serveur** : copie le taux du jour, calcule `montant_gnf` ; inscrit les documents obligatoires de sens `import`.
- **Refus** :
  - `TAUX_ABSENT` — Pas de taux saisi pour cette devise à cette date.
- **Aussi** :
  - Compléter : `PUT dossiers-import/{id}` — tant que le dossier n'est pas `cloture`

> L'objet et le montant de l'exemple sont des valeurs d'illustration.

#### VE-15 · Faire avancer un dossier d'import

- **Permission** : `ventes.dossier-import.saisir`
- **Où** : bouton de l'étape suivante sur la fiche du dossier · confirmation (`default-confirm`)
- **État** (`dossiers_import.statut`) : `commande` → `en_transit` (Expédier) · `en_transit` → `dedouane` (Dédouaner) · `dedouane` → `recu` (Recevoir) · `recu` → `cloture` (Clôturer)
- **Envoi** : `POST dossiers-import/{id}/expedier`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date de réception | `date_reception` | date | — | demandée seulement à l'étape « Recevoir » |

- **Le serveur** : à chaque étape, recalcule `cout_rendu_gnf` : prix d'achat plus frais validés.
- **Refus** :
  - `DOSSIER_INCOMPLET` — Dédouanement refusé tant que les pièces obligatoires ne sont pas validées.
  - `FRAIS_NON_VALIDES` — Clôture refusée tant qu'un frais du dossier attend sa validation.
- **Aussi** :
  - Dédouaner : `POST dossiers-import/{id}/dedouaner`
  - Recevoir : `POST dossiers-import/{id}/recevoir` — corps `{ "date_reception": "2026-03-15" }`
  - Clôturer : `POST dossiers-import/{id}/cloturer` — fige le coût rendu

### 9.11 Documents exigés — `/ventes/documents-exiges`

**Lecture** · `ventes.type-document.voir` · `GET types-documents` · filtres : `sens`, `est_obligatoire`

**Colonnes de la liste** : `ordre`, `code`, `libelle`, `sens`, `est_obligatoire`

#### VE-16 · Régler la liste des documents exigés

- **Permission** : `ventes.type-document.saisir`
- **Où** : bouton « Nouveau document exigé » de la liste · formulaire en dialogue
- **Envoi** : `POST types-documents`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (30) | oui | majuscules : `CERTIFICAT_ORIGINE` |
| Libellé | `libelle` | texte (120) | oui | — |
| Pour | `sens` | liste : `export` · `import` | oui | — |
| Obligatoire | `est_obligatoire` | case à cocher | — | cochée : bloque l'embarquement tant que la pièce n'est pas validée |
| Ordre d'affichage | `ordre` | entier | — | — |

```json
{
  "code": "CERTIFICAT_ORIGINE", "libelle": "Certificat d'origine", "sens": "export",
  "est_obligatoire": true, "ordre": 3
}
```

- **Le serveur** : ne touche pas aux dossiers déjà ouverts : la nouvelle liste vaut pour les dossiers suivants.
- **Refus** :
  - `CODE_DEJA_UTILISE` — Un autre type de document porte ce code.
- **Aussi** :
  - Modifier : `PUT types-documents/{id}` — le `code` ne change plus dès qu'un dossier l'utilise

### 9.12 Rapports — `/ventes/rapports`

**Lecture** · `ventes.rapport.voir` · `GET ventes` · `GET marges` · `GET dossiers-export`

Lecture seule : ventes par client et par mois, marges par lot de vente, délais d'expédition.

---

## 10. Comptabilité

`comptabilite/` · préfixe `co` · espace : Comptabilité (et le superviseur pour ses demandes d'avance) · 40 pages, 35 actions · application à ouvrir (`status: 'soon'`)

Le module à sections : chaque adresse est `/comptabilite/<section>/<page>`. Les quatre premières sections sont dans l'offre signée ; les trois dernières (Comptabilité générale, Clôtures et états, Paramétrage comptable) sont décrites pour que leurs écrans puissent s'ouvrir sans rien réinventer.

**Tout paiement passe par le même formulaire**, `shared/metier/paiement-form/` (§2.5) : date, montant, mode de paiement, compte de trésorerie, référence, et la `reference_unique` créée par le navigateur à l'ouverture (§1.8). Verser une avance, payer une pesée et régler une dépense ne diffèrent que par l'adresse et par la ligne payée ; l'encaissement d'un client y ajoute la devise et le taux du jour.

**Trois personnes pour une avance** : le superviseur la demande, le gérant la décide, la comptabilité la verse. Trois permissions, trois écrans, et le serveur refuse qu'une même personne demande et décide.

> **Section « Avances aux producteurs »** · `/comptabilite/avances/…`

### 10.1 Demandes d'avance — `/comptabilite/avances/demandes`

**Lecture** · `comptabilite.avance.voir` · `GET avances` · filtres : `recherche`, `producteur_id`, `statut`, `demande_par`, `est_derogation`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_demande`, `producteur_id`, `montant_demande`, `plafond`, `montant_valide`, `montant_verse`, `montant_rembourse`, `statut`

Le superviseur n'y voit que les avances de sa zone. Le reste dû d'une ligne = `montant_verse` − `montant_rembourse` (contrôlé par la vue `v_solde_avances`).

### 10.2 Nouvelle demande d'avance — `/comptabilite/avances/demandes/nouvelle`

**Accès** · `comptabilite.avance.demander`

Formulaire en page. Arrivée possible depuis la fiche d'un producteur, avec `?producteurId=…` : le producteur est alors prérempli.

#### CO-01 · Demander une avance

- **Permission** : `comptabilite.avance.demander`
- **Où** : formulaire en page
- **État** (`avances.statut`) : (création) → `proposee`
- **Quand** : campagne `ouverte` ; producteur `actif`
- **Avant la saisie** : `GET producteurs?recherche=…` — producteur ; `GET avances/preparation?producteur_id=1&campagne_id=1` — `estimation_kg`, `prix_kg_reference`, `part_plafond_pct`, `plafond`, `reste_du_precedent`
- **Envoi** : `POST avances`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Producteur | `producteur_id` | sélecteur → `producteurs` | oui | — |
| (campagne choisie) | `campagne_id` | aucun champ | oui | pris dans `ContexteService` |
| Date de la demande | `date_demande` | date | oui | défaut : aujourd'hui |
| Montant demandé | `montant_demande` | montant | oui | supérieur à 0 ; au-dessus du plafond : bandeau « Dérogation à demander au gérant », le motif doit l'expliquer |
| Motif | `motif` | texte (255) | oui | à quoi servira l'argent : désherbage, main-d'œuvre… |
| Kilos que le producteur s'engage à livrer | `objectif_kg` | poids en kg | oui | proposé : la récolte estimée |

**Rempli par le serveur** : `numero`, `estimation_kg`, `prix_kg_reference`, `plafond`, `demande_par`.

```json
{
  "producteur_id": 1, "campagne_id": 1, "date_demande": "2025-12-08", "montant_demande": "2000000.00",
  "motif": "Désherbage et main-d'œuvre", "objectif_kg": "1500.000"
}
```

Réponse (extrait) :

```json
{ "id": 1, "numero": "AV-2025-000001", "estimation_kg": "1600.000", "prix_kg_reference": "6000.00", "plafond": "3840000.00",
  "est_derogation": false, "statut": "proposee" }
```

- **Le serveur** :
  - copie l'estimation de récolte, le prix d'achat et le plafond **du jour** : ils ne bougeront plus, même si les règles changent ;
  - pose `est_derogation` quand le montant dépasse le plafond ;
  - crée la ligne `approbations` (type `avance`, ou `derogation_plafond`) en attente de la décision du gérant.
- **Refus** :
  - `ESTIMATION_ABSENTE` — Aucune visite n'a donné d'estimation de récolte pour ce producteur : pas de plafond calculable.
  - `PRODUCTEUR_NON_ACTIF` — Dossier `incomplet` ou producteur `suspendu`.
  - `AVANCE_DEJA_EN_COURS` — Une demande `proposee` ou `validee` attend déjà pour ce producteur et cette campagne.
  - `CAMPAGNE_FERMEE` — La campagne n'est pas `ouverte`.
- **Ensuite** : ouvrir la fiche de l'avance créée, pastille « À valider ». Le compteur « demandes à valider » du gérant augmente.
- **Aussi** :
  - Modifier une demande : `PUT avances/{id}` — par son auteur, tant que `statut` = `proposee`
  - Annuler une demande : `POST avances/{id}/annuler` — corps `{ "motif": "…" }` ; `proposee` → `annulee`

> Aperçu du plafond avec `plafondAvance` à partir de la préparation. Sékou Camara : 40 % × 1 600 kg × 6 000 GNF = 3 840 000 GNF. Si `reste_du_precedent` est positif, bandeau d'attention avec le montant.

### 10.3 Avance — `/comptabilite/avances/demandes/:avanceId`

**Lecture** · `comptabilite.avance.voir` · `GET avances/{id}`

Renvoie l'avance, le producteur, la décision, les versements (`avance_versements`), les remboursements (`avance_remboursements`), le reste dû et l'approbation liée. Les boutons affichés dépendent du statut et des permissions : décider, verser, rembourser, abandonner.

### 10.4 Validation — `/comptabilite/avances/validation`

**Lecture** · `comptabilite.avance.valider` · `GET avances?statut=proposee` · filtres : `producteur_id`, `est_derogation`, `demande_par`

**Colonnes de la liste** : `numero`, `date_demande`, `producteur_id`, `montant_demande`, `plafond`, `est_derogation`, `demande_par`

File d'attente du gérant. Les dérogations portent une pastille ocre. Le bouton de décision est masqué quand `demande_par` est l'utilisateur connecté.

#### CO-02 · Décider une avance

- **Permission** : `comptabilite.avance.valider`
- **Où** : boutons « Approuver » et « Refuser » de la file de validation ou de la fiche · formulaire en dialogue
- **État** (`avances.statut`) : `proposee` → `validee` (Approuver) · `proposee` → `refusee` (Refuser)
- **Envoi** : `POST avances/{id}/valider`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Montant accordé | `montant_valide` | montant | oui | prérempli avec le montant demandé ; inférieur ou égal à lui |
| Motif | `motif_decision` | texte (255) | — | obligatoire si le montant est réduit ou si c'est une dérogation |
| Livraison attendue avant le | `date_limite_livraison` | date | — | proposée : aujourd'hui + le délai du paramètre `ALERTE_SANS_LIVRAISON_JOURS` |

```json
{
  "montant_valide": "2000000.00", "motif_decision": "Sous le plafond, producteur à jour",
  "date_limite_livraison": "2026-05-31"
}
```

- **Le serveur** :
  - renseigne `decide_par` et `date_decision` ; met à jour la ligne `approbations` : `approuvee`, `reduite` si le montant accordé est plus bas, ou `refusee` ;
  - écrit `statut_historiques` avec le motif.
- **Refus** :
  - `DEMANDEUR_EGAL_DECIDEUR` (403) — La personne qui a demandé ne peut pas décider (contrainte de la base).
  - `MONTANT_SUPERIEUR_A_LA_DEMANDE` — Le montant accordé dépasse le montant demandé.
- **Ensuite** : rafraîchir les compteurs `avances-validation` et `avances-decaissement`.
- **Aussi** :
  - Refuser : `POST avances/{id}/refuser` — corps `{ "motif_decision": "…" }`, obligatoire

> La même décision peut se prendre depuis Pilotage → Approbations (PI-03) : le serveur tient `avances` et `approbations` ensemble, quel que soit l'écran.

### 10.5 Décaissement — `/comptabilite/avances/decaissement`

**Lecture** · `comptabilite.avance.verser` · `GET avances?statut=validee` · `GET avance-versements` · filtres : `avance_id`, `mode_paiement`, `est_annule`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_versement`, `avance_id`, `montant`, `mode_paiement`, `reference_paiement`, `est_annule`

En haut, les avances `validee` à verser : la liste ne contient qu'elles, on ne peut donc pas verser une avance non validée. En dessous, les versements faits.

#### CO-03 · Verser une avance

- **Permission** : `comptabilite.avance.verser`
- **Où** : bouton « Verser » sur une avance `validee` · formulaire en dialogue
- **État** (`avances.statut`) : `validee` → `versee`
- **Avant la saisie** : `GET comptes-tresorerie?est_actif=1` — caisses et comptes, avec leur solde
- **Envoi** : `POST avances/{id}/verser`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date du versement | `date_versement` | date | oui | défaut : aujourd'hui |
| Montant | `montant` | montant | oui | prérempli : montant accordé − déjà versé ; inférieur ou égal à ce reste |
| Mode de paiement | `mode_paiement` | liste : `especes` · `orange_money` · `virement` | oui | — |
| Compte de trésorerie | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | oui | limité aux comptes du mode choisi : `caisse` pour `especes`, `mobile_money` pour `orange_money`, `banque` pour `virement` |
| Référence | `reference_paiement` | texte (50) | — | obligatoire pour Orange Money et virement : numéro de la transaction |
| (créée par le navigateur) | `reference_unique` | aucun champ | oui | `nouvelleReferenceUnique()` à l'ouverture du dialogue ; renvoyée telle quelle si l'envoi repart |

**Rempli par le serveur** : `numero`, `avance_id`, `verse_par`.

```json
{
  "date_versement": "2025-12-10", "montant": "2000000.00", "mode_paiement": "especes",
  "compte_tresorerie_id": 1, "reference_paiement": null,
  "reference_unique": "3f1c2a9e-5b7d-4c8a-9e21-6d4f0b7a1c35"
}
```

- **Le serveur** :
  - écrit `avance_versements` (`VA-2025-000001`) et met à jour `avances.montant_verse` ;
  - écrit la sortie dans `mouvements_tresorerie` (nature `avance_producteur`), diminue `comptes_tresorerie.solde`, passe l'écriture `AVANCE_VERSEMENT` ;
  - émet le reçu d'avance (`documents_emis`, type `recu_avance`).
- **Refus** :
  - `MONTANT_SUPERIEUR_AU_RESTE` — Le montant dépasse ce qui reste à verser.
  - `SOLDE_INSUFFISANT` — Le compte de trésorerie n'a pas ce solde : `details` le donne.
  - `PERIODE_CLOTUREE` — La date tombe dans une période comptable clôturée.
- **Ensuite** : imprimer le reçu, le faire signer, puis joindre sa photo (SE-07, `table_cible` = `avance_versements`, `categorie` = `recu_signe`). Rafraîchir le compteur `avances-decaissement`.
- **Aussi** :
  - Annuler un versement : `POST avance-versements/{id}/annuler` — corps `{ "motif": "…" }` ; pose `est_annule`, écrit le mouvement inverse et extourne l'écriture ; l'avance redevient `validee` ; refusé si un remboursement existe

> Formulaire commun `shared/metier/paiement-form/`.

### 10.6 Suivi des remboursements — `/comptabilite/avances/remboursements`

**Lecture** · `comptabilite.remboursement.voir` · `GET avance-remboursements` · `GET avances?statut=versee,en_retard,soldee` · filtres : `avance_id`, `origine`, `du`, `au`

**Colonnes de la liste** : `date_remboursement`, `avance_id`, `origine`, `pesee_id`, `montant`, `motif`

Pour chaque avance versée : versé, remboursé, reste dû, et le détail des remboursements. Les retenues sur pesée (`origine` = `retenue_pesee`) arrivent seules ; seuls le remboursement en espèces et l'abandon se saisissent.

#### CO-04 · Enregistrer un remboursement en espèces

- **Permission** : `comptabilite.avance.rembourser`
- **Où** : bouton « Remboursement » sur une avance `versee` ou `en_retard` · formulaire en dialogue
- **Envoi** : `POST avances/{id}/rembourser`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date | `date_remboursement` | date | oui | défaut : aujourd'hui |
| Montant remboursé | `montant` | montant | oui | supérieur à 0 ; inférieur ou égal au reste dû |
| Caisse qui reçoit | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | oui | — |
| Commentaire | `motif` | texte (255) | — | — |
| (créée par le navigateur) | `reference_unique` | aucun champ | oui | portée par le mouvement de trésorerie : un double envoi n'encaisse pas deux fois |

**Rempli par le serveur** : `avance_id`, `origine`.

```json
{
  "date_remboursement": "2026-06-10", "montant": "200000.00", "compte_tresorerie_id": 1, "motif": null,
  "reference_unique": "9b2d6f4e-1a3c-4e5f-8a7b-0c1d2e3f4a5b"
}
```

- **Le serveur** :
  - écrit `avance_remboursements` (`origine` = `especes`), augmente `avances.montant_rembourse` ;
  - écrit l'entrée dans `mouvements_tresorerie` (nature `remboursement_avance`) et l'écriture `AVANCE_REMB_ESPECES`.
- **Refus** :
  - `MONTANT_SUPERIEUR_AU_RESTE` — Le montant dépasse le reste dû.
- **Ensuite** : l'avance passe à `soldee` si le reste dû tombe à zéro.

> Le montant de l'exemple est une valeur d'illustration.

#### CO-05 · Abandonner le reste dû d'une avance

- **Permission** : `comptabilite.avance.abandonner`
- **Où** : menu « Plus » de la fiche d'une avance `versee` ou `en_retard` · dialogue de motif (`default-prompt`)
- **Envoi** : `POST avances/{id}/abandonner`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Montant abandonné | `montant` | montant | oui | prérempli : le reste dû |
| Motif de l'abandon | `motif` | texte (255) | oui | décision du gérant : décès, récolte perdue… |

**Rempli par le serveur** : `avance_id`, `origine`, `date_remboursement`.

```json
{
  "montant": "200000.00", "motif": "Récolte détruite par un feu de brousse"
}
```

- **Le serveur** : écrit `avance_remboursements` (`origine` = `abandon`) : aucune entrée d'argent, la perte passe en comptabilité (`AVANCE_ABANDON`).
- **Refus** :
  - `MONTANT_SUPERIEUR_AU_RESTE` — Le montant dépasse le reste dû.
- **Ensuite** : confirmation qui nomme le producteur et le montant avant l'envoi : l'abandon ne se défait pas depuis l'écran.

### 10.7 Avances sans livraison — `/comptabilite/avances/sans-livraison`

**Lecture** · `comptabilite.retard.voir` · `GET avances?statut=en_retard` · filtres : `producteur_id`

**Colonnes de la liste** : `numero`, `producteur_id`, `montant_verse`, `montant_rembourse`, `date_limite_livraison`

Lecture : les avances `en_retard`, avec le nombre de jours de retard et le reste dû. Chaque ligne mène à l'avance (rembourser, abandonner) et à la fiche du producteur.

> **Section « Trésorerie »** · `/comptabilite/tresorerie/…`

### 10.8 Caisses et comptes — `/comptabilite/tresorerie/comptes`

**Liste** · `comptabilite.tresorerie.voir` · `GET comptes-tresorerie` · `GET mouvements-tresorerie` · filtres : `type`, `devise_id`, `est_actif`

**Colonnes de la liste** : `code`, `libelle`, `type`, `devise_id`, `responsable_id`, `solde`, `est_actif`

Une carte par caisse, banque ou compte Orange Money, avec son solde dans sa devise. `numero_compte` n'est jamais affiché en entier dans une liste.

**Fiche** · `/comptabilite/tresorerie/comptes/:compteId` · `GET comptes-tresorerie/{id}`

Solde, mouvements du compte (liste paginée de `mouvements_tresorerie`), clôtures de caisse ou rapprochements.

#### CO-06 · Créer ou modifier un compte de trésorerie

- **Permission** : `comptabilite.tresorerie.saisir`
- **Où** : bouton « Nouveau compte » de la page Caisses et comptes · formulaire en dialogue
- **Avant la saisie** : `GET comptes?classe=5` — comptes du plan comptable de la classe 5
- **Envoi** : `POST comptes-tresorerie`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (20) | oui | court : `CAISSE`, `OM`, `BNQ-GNF` |
| Libellé | `libelle` | texte (100) | oui | — |
| Type | `type` | liste : `caisse` · `banque` · `mobile_money` | oui | décide des champs suivants |
| Devise | `devise_id` | sélecteur → `devises` | oui | non modifiable après le premier mouvement |
| Banque | `banque` | texte (100) | — | affiché pour le type `banque` |
| Numéro du compte | `numero_compte` | texte (50) | — | affiché pour `banque` et `mobile_money` ; masqué dans les listes |
| Zone | `zone_id` | sélecteur → `zones` | — | pour une caisse de terrain |
| Responsable | `responsable_id` | sélecteur → `utilisateurs` | — | celui qui clôture la caisse et reçoit les transferts |
| Compte du plan comptable | `compte_id` | sélecteur → `comptes` | oui | 571 pour une caisse, 521 pour une banque, 552 pour Orange Money |
| Actif | `est_actif` | case à cocher | — | — |

```json
{
  "code": "CAISSE", "libelle": "Caisse principale", "type": "caisse", "devise_id": 1, "banque": null,
  "numero_compte": null, "zone_id": null, "responsable_id": 2, "compte_id": 57, "est_actif": true
}
```

- **Refus** :
  - `CODE_DEJA_UTILISE` — Un autre compte porte ce code.
- **Aussi** :
  - Modifier : `PUT comptes-tresorerie/{id}` — le solde (`solde`) ne se saisit jamais : il vient des mouvements

### 10.9 Journal de caisse et banque — `/comptabilite/tresorerie/journal`

**Lecture** · `comptabilite.tresorerie.voir` · `GET mouvements-tresorerie` · filtres : `compte_tresorerie_id`, `sens`, `nature`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_mouvement`, `compte_tresorerie_id`, `sens`, `montant`, `montant_gnf`, `nature`, `libelle`, `origine_table`, `origine_id`

**Lecture** : aucun mouvement ne se crée ici. Chaque ligne mène à l'opération qui l'explique (`origine_table`, `origine_id`, traduits par `core/navigation/origines.ts`). Ligne de total des entrées et des sorties en GNF.

#### CO-07 · Contre-passer un mouvement

- **Permission** : `comptabilite.tresorerie.saisir`
- **Où** : menu « Plus » d'une ligne du journal · dialogue de motif (`default-prompt`)
- **Quand** : mouvement de nature `depense`, `encaissement_client`, `salaire`, `avance_salaire`, `transfert` ou `ajustement`, pas encore contre-passé
- **Envoi** : `POST mouvements-tresorerie/{id}/contre-passer`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Motif | `motif` | texte (255) | oui | repris dans le libellé du mouvement inverse |

```json
{
  "motif": "Règlement saisi deux fois"
}
```

- **Le serveur** :
  - écrit le mouvement inverse (`mouvement_annule_id`), corrige le solde du compte et extourne l'écriture comptable ;
  - remet l'opération d'origine dans son état d'avant : une dépense `payee` redevient `validee`, une facture `payee` redevient `emise`.
- **Refus** :
  - `ANNULATION_PAR_L_OPERATION` — Versement d'avance ou paiement de pesée : s'annule depuis l'opération (« Annuler un versement », « Annuler un paiement »), pas ici.
  - `MOUVEMENT_DEJA_ANNULE` — Ce mouvement a déjà été contre-passé.
  - `MOUVEMENT_RAPPROCHE` — Le mouvement figure dans un rapprochement bancaire validé.
  - `PERIODE_CLOTUREE` — Le mouvement date d'une période comptable clôturée.

### 10.10 Paiements aux producteurs — `/comptabilite/tresorerie/paiements-producteurs`

**Lecture** · `comptabilite.paiement-producteur.voir` · `GET paiements-producteurs` · `GET pesees?statut=validee` · filtres : `producteur_id`, `mode_paiement`, `est_annule`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_paiement`, `pesee_id`, `producteur_id`, `montant`, `mode_paiement`, `reference_paiement`, `est_annule`

En haut, les pesées `validee` à payer (net à payer − déjà payé), cochables pour les payer une à une à la suite ; en dessous, les paiements faits. Une pesée bloquée pour humidité porte la pastille rouge et n'a pas de bouton « Payer ».

#### CO-08 · Payer une pesée

- **Permission** : `comptabilite.paiement-producteur.payer`
- **Où** : bouton « Payer » sur une pesée `validee` · formulaire en dialogue
- **État** (`pesees.statut`) : `validee` → `payee`
- **Avant la saisie** : `GET comptes-tresorerie?est_actif=1` — caisses et comptes, avec leur solde
- **Envoi** : `POST pesees/{id}/payer`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date du paiement | `date_paiement` | date | oui | défaut : aujourd'hui |
| Montant | `montant` | montant | oui | prérempli : net à payer − déjà payé ; inférieur ou égal à ce reste |
| Mode de paiement | `mode_paiement` | liste : `especes` · `orange_money` · `virement` | oui | Orange Money proposé d'abord : le numéro du producteur s'affiche |
| Compte de trésorerie | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | oui | limité aux comptes du mode choisi |
| Référence | `reference_paiement` | texte (50) | — | obligatoire pour Orange Money et virement |
| (créée par le navigateur) | `reference_unique` | aucun champ | oui | `nouvelleReferenceUnique()` à l'ouverture du dialogue |

**Rempli par le serveur** : `numero`, `pesee_id`, `producteur_id`, `paye_par`.

```json
{
  "date_paiement": "2026-03-18", "montant": "1512000.00", "mode_paiement": "orange_money",
  "compte_tresorerie_id": 2, "reference_paiement": "[RÉFÉRENCE OM]",
  "reference_unique": "7c4e1b2a-8d9f-4a6b-b3c5-2e1f0a9d8c7b"
}
```

- **Le serveur** :
  - écrit `paiements_producteurs` (`PP-2026-000001`), met à jour `pesees.montant_paye` ; la pesée passe à `payee` quand le net est payé en entier ;
  - écrit la sortie dans `mouvements_tresorerie` (nature `paiement_pesee`) et l'écriture `PESEE_PAIEMENT` ; émet le reçu de paiement (`documents_emis`, type `recu_paiement`).
- **Refus** :
  - `PESEE_BLOQUEE_HUMIDITE` — L'humidité dépassait le maximum à l'achat : la pesée doit être corrigée après séchage.
  - `MONTANT_SUPERIEUR_AU_RESTE` — Le montant dépasse le reste à payer.
  - `SOLDE_INSUFFISANT` — Le compte de trésorerie n'a pas ce solde.
  - `PERIODE_CLOTUREE` — La date tombe dans une période comptable clôturée.
- **Ensuite** : rafraîchir le compteur `tresorerie-paiements-producteurs` ; en paiement à la suite, ouvrir la pesée cochée suivante avec une **nouvelle** `reference_unique`.
- **Aussi** :
  - Annuler un paiement : `POST paiements-producteurs/{id}/annuler` — corps `{ "motif": "…" }` ; pose `est_annule`, écrit le mouvement inverse, extourne l'écriture ; la pesée redevient `validee`

> Formulaire commun `shared/metier/paiement-form/`. Sékou Camara, première pesée : 1 512 000 GNF par Orange Money.

### 10.11 Encaissements clients — `/comptabilite/tresorerie/encaissements`

**Lecture** · `comptabilite.encaissement.voir` · `GET encaissements` · `GET factures?statut=emise,payee_partiel` · filtres : `client_id`, `facture_id`, `mode_paiement`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_encaissement`, `facture_id`, `client_id`, `montant_devise`, `taux_change`, `montant_gnf`, `ecart_change_gnf`, `mode_paiement`

En haut, les factures `emise` ou `payee_partiel` à encaisser, les échues d'abord ; en dessous, les encaissements faits.

#### CO-09 · Encaisser une facture

- **Permission** : `comptabilite.encaissement.saisir`
- **Où** : bouton « Encaisser » sur une facture à encaisser · formulaire en dialogue
- **État** (`factures.statut`) : `emise` ou `payee_partiel` → `payee`
- **Avant la saisie** : `GET encaissements/preparation?facture_id=1&date_encaissement=2026-07-05` — `reste_a_encaisser` en devise, taux de la facture, taux du jour ; `GET comptes-tresorerie?est_actif=1` — comptes dans la devise de la facture
- **Envoi** : `POST factures/{id}/encaisser`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date de l'encaissement | `date_encaissement` | date | oui | défaut : aujourd'hui |
| Montant reçu | `montant_devise` | montant | oui | dans la devise de la facture ; prérempli avec le reste à encaisser |
| Taux du jour | `taux_change` | taux de change | oui | proposé par la préparation ; modifiable pour suivre le taux réel de la banque ; 1 pour une facture en GNF |
| Mode de paiement | `mode_paiement` | liste : `virement` · `especes` · `cheque` · `orange_money` | oui | — |
| Compte qui reçoit | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | oui | limité aux comptes de la devise de la facture |
| Référence | `reference_paiement` | texte (50) | — | référence du virement |
| (créée par le navigateur) | `reference_unique` | aucun champ | oui | `nouvelleReferenceUnique()` à l'ouverture du dialogue |

**Rempli par le serveur** : `numero`, `facture_id`, `client_id`, `devise_id`, `montant_gnf`, `saisi_par`.

```json
{
  "date_encaissement": "2026-07-05", "montant_devise": "1883.25", "taux_change": "8720.000000",
  "mode_paiement": "virement", "compte_tresorerie_id": 4, "reference_paiement": null,
  "reference_unique": "1d8a3c5e-7f2b-4d6c-a9e1-4b3c2d1e0f9a"
}
```

Réponse (extrait) :

```json
{ "id": 1, "numero": "EN-2026-000001", "montant_gnf": "16421940.00", "ecart_change_gnf": "37665.00",
  "facture": { "id": 1, "statut": "payee" } }
```

- **Le serveur** :
  - calcule `montant_gnf` au taux du jour et `ecart_change_gnf` par rapport au taux de la facture : positif, c'est un gain ;
  - écrit l'entrée dans `mouvements_tresorerie` (nature `encaissement_client`) et l'écriture `ENCAISSEMENT_CLIENT`, gain ou perte de change compris ;
  - met à jour la facture (`payee_partiel` ou `payee`), `ventes.montant_encaisse_gnf` et le statut de la vente ; au dernier encaissement, le lot de vente passe à `encaisse`.
- **Refus** :
  - `MONTANT_SUPERIEUR_AU_RESTE` — Le montant dépasse le reste à encaisser.
  - `DEVISE_DU_COMPTE` — Le compte de trésorerie n'est pas dans la devise de la facture.
  - `PERIODE_CLOTUREE` — La date tombe dans une période comptable clôturée.
- **Ensuite** : rafraîchir le compteur `tresorerie-encaissements`.

> Formulaire à part, bâti comme le formulaire commun des paiements (§2.5) : il y ajoute le montant en devise et le taux du jour. Aperçu avec `enGnf` et `ecartChange`. Sékou Camara : 1 883,25 USD au taux de 8 720 = 16 421 940 GNF, soit un gain de change de 37 665 GNF.

### 10.12 Transferts de fonds — `/comptabilite/tresorerie/transferts`

**Lecture** · `comptabilite.transfert.voir` · `GET transferts-fonds` · filtres : `statut`, `compte_source_id`, `compte_destination_id`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_transfert`, `compte_source_id`, `compte_destination_id`, `montant`, `motif`, `statut`

#### CO-10 · Demander un transfert de fonds

- **Permission** : `comptabilite.transfert.demander`
- **Où** : bouton « Nouveau transfert » de la liste · formulaire en dialogue
- **État** (`transferts_fonds.statut`) : (création) → `demande`
- **Avant la saisie** : `GET comptes-tresorerie?est_actif=1` — comptes et soldes
- **Envoi** : `POST transferts-fonds`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Du compte | `compte_source_id` | sélecteur → `comptes_tresorerie` | oui | — |
| Vers le compte | `compte_destination_id` | sélecteur → `comptes_tresorerie` | oui | différent du compte source ; même devise |
| Date | `date_transfert` | date | oui | défaut : aujourd'hui |
| Montant | `montant` | montant | oui | supérieur à 0 ; attention s'il dépasse le solde du compte source |
| Motif | `motif` | texte (200) | oui | « Approvisionnement de la caisse » |

**Rempli par le serveur** : `numero`, `demande_par`.

```json
{
  "compte_source_id": 3, "compte_destination_id": 1, "date_transfert": "2025-12-05",
  "montant": "20000000.00", "motif": "Approvisionnement"
}
```

- **Le serveur** : crée la demande et une ligne `approbations` (type `transfert_fonds`) ; aucun argent ne bouge encore.
- **Refus** :
  - `COMPTES_IDENTIQUES` — Source et destination sont le même compte (contrainte de la base).
  - `DEVISES_DIFFERENTES` — Un transfert se fait entre deux comptes de la même devise.
- **Aussi** :
  - Annuler une demande : `POST transferts-fonds/{id}/annuler` — corps `{ "motif": "…" }` ; `demande` → `annule`

> Le montant de l'exemple est une valeur d'essai de la base.

#### CO-11 · Valider un transfert de fonds

- **Permission** : `comptabilite.transfert.valider`
- **Où** : bouton « Valider » sur un transfert `demande` · confirmation (`default-confirm`)
- **État** (`transferts_fonds.statut`) : `demande` → `valide`
- **Envoi** : `POST transferts-fonds/{id}/valider`
- **Le serveur** : renseigne `valide_par` ; l'argent **sort** du compte source : mouvement de sortie (nature `transfert`) et écriture `TRANSFERT_SORTIE`.
- **Refus** :
  - `DEMANDEUR_EGAL_DECIDEUR` (403) — La personne qui a demandé ne peut pas valider.
  - `SOLDE_INSUFFISANT` — Le compte source n'a pas ce solde.
- **Ensuite** : rafraîchir le compteur `tresorerie-transferts` : le transfert attend maintenant sa réception.

#### CO-12 · Recevoir un transfert de fonds

- **Permission** : `comptabilite.transfert.recevoir`
- **Où** : bouton « J'ai reçu les fonds » sur un transfert `valide` · confirmation (`default-confirm`)
- **État** (`transferts_fonds.statut`) : `valide` → `recu`
- **Envoi** : `POST transferts-fonds/{id}/recevoir`
- **Le serveur** :
  - l'argent **entre** dans le compte de destination : mouvement d'entrée et écriture `TRANSFERT_ENTREE` ;
  - entre la validation et la réception, la somme est en route : elle n'est dans aucun des deux soldes.
- **Ensuite** : confirmation qui nomme le montant et le compte ; rafraîchir le compteur `tresorerie-transferts`.

### 10.13 Clôtures de caisse — `/comptabilite/tresorerie/clotures-caisse`

**Lecture** · `comptabilite.cloture-caisse.voir` · `GET clotures-caisse` · filtres : `compte_tresorerie_id`, `du`, `au`

**Colonnes de la liste** : `date_cloture`, `compte_tresorerie_id`, `solde_theorique`, `solde_compte`, `ecart`, `cloture_par`, `valide_par`

#### CO-13 · Clôturer une caisse

- **Permission** : `comptabilite.cloture-caisse.saisir`
- **Où** : bouton « Clôturer la caisse » de la page ou de la fiche d'une caisse · formulaire en dialogue
- **Avant la saisie** : `GET clotures-caisse/preparation?compte_tresorerie_id=1&date_cloture=2026-03-18` — `solde_theorique` et mouvements du jour
- **Envoi** : `POST clotures-caisse`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Caisse | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | oui | limité aux comptes de type `caisse` dont l'utilisateur est responsable |
| Date | `date_cloture` | date | oui | défaut : aujourd'hui ; une seule clôture par caisse et par jour |
| Argent compté | `solde_compte` | montant | oui | l'écart avec le solde calculé s'affiche pendant la saisie |
| Justification | `justification` | texte (255) | — | obligatoire dès qu'il y a un écart |

**Rempli par le serveur** : `solde_theorique`, `ecart`, `cloture_par`.

```json
{
  "compte_tresorerie_id": 1, "date_cloture": "2026-03-18", "solde_compte": "17550000.00",
  "justification": null
}
```

- **Le serveur** : calcule `solde_theorique` à partir des mouvements jusqu'à cette date, puis `ecart` = compté − calculé.
- **Refus** :
  - `CLOTURE_DEJA_FAITE` — Cette caisse est déjà clôturée à cette date.
  - `JUSTIFICATION_REQUISE` — Un écart sans justification.

> Le solde de l'exemple est une valeur d'illustration.

#### CO-14 · Valider une clôture de caisse

- **Permission** : `comptabilite.cloture-caisse.valider`
- **Où** : bouton « Valider » sur une clôture sans `valide_par` · confirmation (`default-confirm`)
- **Envoi** : `POST clotures-caisse/{id}/valider`
- **Le serveur** :
  - renseigne `valide_par` ;
  - s'il y a un écart : écrit un mouvement d'`ajustement` dans `mouvements_tresorerie` pour ramener le solde à l'argent compté, et lève une alerte `ecart_caisse`.
- **Ensuite** : la clôture passe en lecture seule. Celui qui compte la caisse et celui qui valide ont deux permissions distinctes.

### 10.14 Rapprochements bancaires — `/comptabilite/tresorerie/rapprochements`

**Liste** · `comptabilite.rapprochement.voir` · `GET rapprochements-bancaires` · filtres : `compte_tresorerie_id`, `statut`

**Colonnes de la liste** : `date_releve`, `compte_tresorerie_id`, `solde_releve`, `solde_comptable`, `ecart`, `statut`

**Fiche** · `/comptabilite/tresorerie/rapprochements/:rapprochementId` · `GET rapprochements-bancaires/{id}`

Deux colonnes : les mouvements du compte non encore pointés, et ceux pointés sur ce relevé. L'écart se recalcule à chaque coche.

#### CO-15 · Ouvrir un rapprochement et pointer

- **Permission** : `comptabilite.rapprochement.saisir`
- **Où** : bouton « Nouveau rapprochement » de la liste · formulaire en dialogue
- **État** (`rapprochements_bancaires.statut`) : (création) → `en_cours`
- **Envoi** : `POST rapprochements-bancaires`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Compte | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | oui | limité aux types `banque` et `mobile_money` |
| Date du relevé | `date_releve` | date | oui | — |
| Solde du relevé | `solde_releve` | montant | oui | tel qu'il figure sur le relevé de la banque |

**Rempli par le serveur** : `solde_comptable`, `ecart`.

```json
{
  "compte_tresorerie_id": 3, "date_releve": "2026-03-31", "solde_releve": "31250000.00"
}
```

- **Le serveur** : calcule `solde_comptable` à la date du relevé et l'`ecart`.
- **Ensuite** : ouvrir la fiche pour pointer.
- **Aussi** :
  - Pointer les mouvements : `PUT rapprochements-bancaires/{id}` — corps `{ "mouvement_ids": [12, 15, 18] }` : la liste entière des mouvements pointés ; le serveur renseigne `mouvements_tresorerie.rapprochement_id`

> Le solde de l'exemple est une valeur d'illustration.

#### CO-16 · Valider un rapprochement

- **Permission** : `comptabilite.rapprochement.valider`
- **Où** : bouton « Valider » de la fiche · confirmation (`default-confirm`)
- **État** (`rapprochements_bancaires.statut`) : `en_cours` → `valide`
- **Envoi** : `POST rapprochements-bancaires/{id}/valider`
- **Le serveur** : renseigne `valide_par` ; les mouvements pointés ne peuvent plus être contre-passés.
- **Refus** :
  - `ECART_NON_EXPLIQUE` — Le solde du relevé ne correspond pas au solde comptable corrigé des mouvements non pointés.

> **Section « Dépenses »** · `/comptabilite/depenses/…`

### 10.15 Dépenses — `/comptabilite/depenses/liste`

**Liste** · `comptabilite.depense.voir` · `GET depenses` · filtres : `recherche`, `nature_depense_id`, `fournisseur_id`, `statut`, `lot_id`, `lot_vente_id`, `dossier_export_id`, `dossier_import_id`, `zone_id`, `depot_id`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_depense`, `nature_depense_id`, `fournisseur_id`, `libelle`, `montant_ttc`, `montant_gnf`, `montant_paye`, `statut`

Ligne de total en GNF. Les filtres par lot et par dossier servent aux liens venus de Dépôts et de Ventes.

**Fiche** · `/comptabilite/depenses/liste/:depenseId` · `GET depenses/{id}`

Renvoie la dépense, son justificatif (`pieces_jointes`), ce à quoi elle est imputée, ses règlements et l'écriture comptable.

#### CO-17 · Saisir une dépense

- **Permission** : `comptabilite.depense.saisir`
- **Où** : bouton « Nouvelle dépense » de la liste · formulaire en page
- **État** (`depenses.statut`) : (création) → `saisie`
- **Avant la saisie** : `GET natures-depense?est_actif=1` — natures ; `GET fournisseurs?recherche=…` — fournisseur ; `GET taxes?est_actif=1` — taxes
- **Envoi** : `POST depenses`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date | `date_depense` | date | oui | défaut : aujourd'hui |
| Nature | `nature_depense_id` | sélecteur → `natures_depense` | oui | décide du compte de charge et, si elle porte une `nature_cout`, de l'entrée dans le coût de revient |
| Fournisseur | `fournisseur_id` | sélecteur → `fournisseurs` | — | facultatif pour une petite dépense de caisse |
| Libellé | `libelle` | texte (200) | oui | — |
| Devise | `devise_id` | sélecteur → `devises` | oui | défaut : GNF |
| Taux | `taux_change` | taux de change | — | 1 en GNF ; sinon proposé : taux du jour |
| Montant hors taxe | `montant_ht` | montant | oui | supérieur à 0 |
| Taxe | `taxe_id` | sélecteur → `taxes` | — | vide : pas de taxe |
| Facture à payer plus tard | `est_a_credit` | case à cocher | — | cochée : ouvre l'échéance |
| Échéance | `date_echeance` | date | — | obligatoire si la case précédente est cochée |
| Lot du dépôt | `lot_id` | sélecteur → `lots` | — | imputation : au plus **un** de ces cinq rattachements |
| Lot de vente | `lot_vente_id` | sélecteur → `lots_vente` | — | — |
| Bordereau | `bordereau_id` | sélecteur → `bordereaux` | — | pour un transport de collecte |
| Dossier d'export | `dossier_export_id` | sélecteur → `dossiers_export` | — | — |
| Dossier d'import | `dossier_import_id` | sélecteur → `dossiers_import` | — | — |
| Zone | `zone_id` | sélecteur → `zones` | — | pour une dépense de terrain |
| Dépôt | `depot_id` | sélecteur → `depots` | — | pour une dépense de dépôt |
| Campagne | `campagne_id` | sélecteur → `campagnes` | — | préremplie avec la campagne choisie ; vide pour une dépense générale (loyer) |

**Rempli par le serveur** : `numero`, `montant_ttc`, `montant_gnf`.

```json
{
  "date_depense": "2026-05-26", "nature_depense_id": 1, "fournisseur_id": 1,
  "libelle": "Transport du bordereau BE-2026-000001", "devise_id": 1, "taux_change": "1.000000",
  "montant_ht": "450000.00", "taxe_id": null, "est_a_credit": false, "date_echeance": null, "lot_id": 1,
  "bordereau_id": 1, "campagne_id": 1
}
```

- **Le serveur** : calcule `montant_taxe`, `montant_ttc` et `montant_gnf`.
- **Refus** :
  - `IMPUTATION_REQUISE` — La nature entre dans le coût de revient (`nature_cout`) mais aucun lot ni dossier n'est choisi.
  - `TAUX_ABSENT` — Dépense en devise sans taux.
- **Ensuite** : proposer de joindre le justificatif (SE-07, `table_cible` = `depenses`, `categorie` = `justificatif`). Compteur `depenses-liste`.
- **Aussi** :
  - Modifier une dépense saisie : `PUT depenses/{id}` — tant que `statut` = `saisie`
  - Annuler une dépense saisie : `POST depenses/{id}/annuler` — corps `{ "motif": "…" }` ; `saisie` → `annulee`

#### CO-18 · Valider une dépense

- **Permission** : `comptabilite.depense.valider`
- **Où** : bouton « Valider » de la fiche ou de la liste (statut `saisie`) · confirmation (`default-confirm`)
- **État** (`depenses.statut`) : `saisie` → `validee`
- **Envoi** : `POST depenses/{id}/valider`
- **Le serveur** :
  - renseigne `validee_par` ; passe l'écriture `DEPENSE_VALIDATION` au compte du fournisseur (`tiers`) ;
  - si la nature porte une `nature_cout` : ajoute la dépense au coût du lot ou du lot de vente (`lot_couts`).
- **Refus** :
  - `JUSTIFICATIF_MANQUANT` — Aucune pièce jointe sur la dépense.
  - `PERIODE_CLOTUREE` — La date tombe dans une période comptable clôturée.
- **Ensuite** : rafraîchir les compteurs `depenses-liste` et `depenses-reglements`.
- **Aussi** :
  - Annuler une dépense validée : `POST depenses/{id}/annuler` — corps `{ "motif": "…" }` ; `validee` → `annulee`, écriture extournée, coût retiré du lot ; refusé si un règlement existe

### 10.16 Règlements — `/comptabilite/depenses/reglements`

**Lecture** · `comptabilite.reglement.voir` · `GET paiements-depenses` · `GET depenses?statut=validee,payee_partiel` · filtres : `depense_id`, `mode_paiement`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_paiement`, `depense_id`, `montant`, `mode_paiement`, `reference_paiement`

En haut, les dépenses `validee` ou `payee_partiel` à régler, les échues d'abord ; en dessous, les règlements faits.

#### CO-19 · Régler une dépense

- **Permission** : `comptabilite.reglement.payer`
- **Où** : bouton « Régler » sur une dépense à régler · formulaire en dialogue
- **État** (`depenses.statut`) : `validee` ou `payee_partiel` → `payee`
- **Avant la saisie** : `GET comptes-tresorerie?est_actif=1` — caisses et comptes, avec leur solde
- **Envoi** : `POST depenses/{id}/payer`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date du règlement | `date_paiement` | date | oui | défaut : aujourd'hui |
| Montant | `montant` | montant | oui | prérempli : montant TTC − déjà réglé ; inférieur ou égal à ce reste |
| Mode de paiement | `mode_paiement` | liste : `especes` · `orange_money` · `virement` · `cheque` | oui | — |
| Compte de trésorerie | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | oui | limité aux comptes du mode choisi et de la devise de la dépense |
| Référence | `reference_paiement` | texte (50) | — | numéro du chèque, du virement ou de la transaction |
| (créée par le navigateur) | `reference_unique` | aucun champ | oui | `nouvelleReferenceUnique()` à l'ouverture du dialogue |

**Rempli par le serveur** : `numero`, `depense_id`, `paye_par`.

```json
{
  "date_paiement": "2026-05-26", "montant": "450000.00", "mode_paiement": "especes",
  "compte_tresorerie_id": 1, "reference_paiement": null,
  "reference_unique": "5e7a9c1b-3d2f-4b8a-8c6e-9f0a1b2c3d4e"
}
```

- **Le serveur** :
  - écrit `paiements_depenses` (`PD-2026-000001`), met à jour `depenses.montant_paye` ; la dépense passe à `payee_partiel` ou `payee` ;
  - écrit la sortie dans `mouvements_tresorerie` (nature `depense`) et l'écriture `DEPENSE_PAIEMENT`.
- **Refus** :
  - `MONTANT_SUPERIEUR_AU_RESTE` — Le montant dépasse le reste à régler.
  - `SOLDE_INSUFFISANT` — Le compte de trésorerie n'a pas ce solde.
  - `PERIODE_CLOTUREE` — La date tombe dans une période comptable clôturée.
- **Ensuite** : rafraîchir le compteur `depenses-reglements`. Un règlement saisi par erreur se défait par le journal (CO-07).

> Formulaire commun `shared/metier/paiement-form/`.

### 10.17 Fournisseurs — `/comptabilite/depenses/fournisseurs`

**Liste** · `comptabilite.fournisseur.voir` · `GET fournisseurs` · filtres : `recherche`, `type`, `statut`

**Colonnes de la liste** : `code`, `raison_sociale`, `type`, `pays`, `telephone`, `delai_paiement_jours`, `statut`

**Fiche** · `/comptabilite/depenses/fournisseurs/:fournisseurId` · `GET fournisseurs/{id}`

Coordonnées, dépenses du fournisseur et `solde_du` : ce qui reste à lui régler.

#### CO-20 · Créer un fournisseur

- **Permission** : `comptabilite.fournisseur.saisir`
- **Où** : bouton « Nouveau fournisseur » de la liste · formulaire en dialogue
- **État** (`fournisseurs.statut`) : (création) → `actif`
- **Envoi** : `POST fournisseurs`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Nom ou raison sociale | `raison_sociale` | texte (150) | oui | — |
| Type | `type` | liste : `transporteur` · `transitaire` · `intrants` · `prestataire` · `administration` · `autre` | oui | — |
| Pays | `pays` | texte (60) | — | défaut : Guinée |
| Téléphone | `telephone` | téléphone (20) | — | — |
| Courriel | `email` | courriel (150) | — | — |
| NIF | `nif` | texte (30) | — | — |
| Délai de paiement | `delai_paiement_jours` | entier | — | en jours ; sert à proposer l'échéance d'une facture à crédit |

**Rempli par le serveur** : `code`.

```json
{
  "raison_sociale": "[TRANSPORTEUR]", "type": "transporteur", "pays": "Guinée", "telephone": null,
  "email": null, "nif": null, "delai_paiement_jours": 0
}
```

- **Le serveur** : attribue le `code` (`FO-0001`) et crée le compte du fournisseur dans `tiers` (type `fournisseur`).
- **Aussi** :
  - Modifier : `PUT fournisseurs/{id}` — mêmes champs
  - Suspendre : `POST fournisseurs/{id}/suspendre` — corps `{ "motif": "…" }` ; plus de nouvelle dépense avec lui
  - Réactiver : `POST fournisseurs/{id}/reactiver`
  - Désactiver : `POST fournisseurs/{id}/desactiver` — refusé s'il reste une dépense à régler

### 10.18 Natures de dépense — `/comptabilite/depenses/natures`

**Lecture** · `comptabilite.nature-depense.voir` · `GET natures-depense` · filtres : `est_actif`, `nature_cout`

**Colonnes de la liste** : `code`, `libelle`, `compte_id`, `nature_cout`, `est_actif`

#### CO-21 · Créer ou modifier une nature de dépense

- **Permission** : `comptabilite.nature-depense.saisir`
- **Où** : bouton « Nouvelle nature » de la liste · formulaire en dialogue
- **Avant la saisie** : `GET comptes?classe=6` — comptes de charge
- **Envoi** : `POST natures-depense`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (30) | oui | majuscules : `TRANSPORT_COLLECTE`, `SACS`, `LOYER` |
| Libellé | `libelle` | texte (120) | oui | — |
| Compte de charge | `compte_id` | sélecteur → `comptes` | oui | compte de la classe 6 |
| Entre dans le coût de revient comme | `nature_cout` | liste : `transport` · `traitement` · `main_oeuvre` · `emballage` · `frais_export` · `autre` | — | vide : dépense générale, hors coût de revient |
| Active | `est_actif` | case à cocher | — | — |

```json
{
  "code": "TRANSPORT_COLLECTE", "libelle": "Transport de la collecte", "compte_id": 61,
  "nature_cout": "transport", "est_actif": true
}
```

- **Refus** :
  - `CODE_DEJA_UTILISE` — Une autre nature porte ce code.
- **Aussi** :
  - Modifier : `PUT natures-depense/{id}` — le compte et la `nature_cout` ne changent que pour les dépenses à venir

> **Section « Coûts et résultat »** · `/comptabilite/analyse/…`

### 10.19 Coût de revient — `/comptabilite/analyse/cout-revient`

**Lecture** · `comptabilite.cout.voir` · `GET cout-revient/lots-vente` · `GET lot-couts` · filtres : `lot_vente_id`, `lot_id`, `nature`

Lecture seule, même bloc `shared/metier/cout-revient/` que dans Ventes. Chaque coût mène à sa pesée, son bordereau ou sa dépense.

### 10.20 Résultat de campagne — `/comptabilite/analyse/resultat-campagne`

**Lecture** · `comptabilite.resultat.voir` · `GET resultat-campagnes`

Lecture seule (`v_resultat_campagnes`) : produits de la classe 7 moins charges de la classe 6, sur l'axe campagne des écritures. Il ne reflète que les opérations validées.

### 10.21 Rapports et exports — `/comptabilite/analyse/exports`

**Accès** · `comptabilite.export.faire`

Pas de liste : une grille des états disponibles (journal de trésorerie, dépenses, paiements aux producteurs, avances, encaissements), chacun avec sa période et son format.

#### CO-22 · Exporter un état

- **Permission** : `comptabilite.export.faire`
- **Où** : bouton « Exporter » d'un état de la grille, ou d'une liste qui le propose · formulaire en dialogue
- **Envoi** : `GET exports/journal-tresorerie?format=xlsx&du=2026-01-01&au=2026-03-31`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Format | `format` | liste : `pdf` · `xlsx` | oui | — |
| Du | `du` | date | oui | — |
| Au | `au` | date | oui | après le début ; un an au plus |
| Compte | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | — | selon l'état : les filtres de la liste d'origine sont repris |

- **Le serveur** :
  - renvoie le fichier (réponse binaire, nom proposé par l'en-tête `Content-Disposition`) ; le PDF porte l'en-tête de la société ;
  - écrit `journal_activites` (action `export`) : qui a sorti quoi, sur quelle période.
- **Refus** :
  - `PERIODE_TROP_LONGUE` (422) — Période de plus d'un an.
- **Ensuite** : téléchargement par le navigateur (`responseType: 'blob'`). États disponibles : `journal-tresorerie`, `depenses`, `paiements-producteurs`, `avances`, `encaissements`.

> **Section « Comptabilité générale »** · `/comptabilite/generale/…` — section fermée (`status: 'soon'`), décrite pour mémoire

### 10.22 Écritures — `/comptabilite/generale/ecritures`

**Liste** · `comptabilite.ecriture.voir` · `GET ecritures` · filtres : `recherche`, `journal_id`, `periode_id`, `statut`, `est_automatique`, `origine_table`, `du`, `au`

**Colonnes de la liste** : `date_ecriture`, `journal_id`, `numero_piece`, `reference`, `libelle`, `total_debit`, `total_credit`, `est_automatique`, `statut`

La plupart des écritures sont **automatiques** : le serveur les passe à chaque action validée, d'après `schemas_comptables`. Elles sont en lecture seule et mènent à leur opération d'origine.

**Fiche** · `/comptabilite/generale/ecritures/:ecritureId` · `GET ecritures/{id}`

Entête et lignes (`ecriture_lignes`) : compte, tiers, débit, crédit, axes d'analyse.

#### CO-23 · Saisir une écriture manuelle

- **Permission** : `comptabilite.ecriture.saisir`
- **Où** : bouton « Nouvelle écriture » de la liste · formulaire en page
- **État** (`ecritures.statut`) : (création) → `brouillard`
- **Avant la saisie** : `GET journaux?est_actif=1` — journaux ; `GET comptes?est_imputable=1` — comptes imputables ; `GET tiers?recherche=…` — tiers
- **Envoi** : `POST ecritures`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Journal | `journal_id` | sélecteur → `journaux` | oui | opérations diverses par défaut |
| Date | `date_ecriture` | date | oui | dans une période `ouverte` |
| Référence | `reference` | texte (50) | — | numéro de la pièce justificative |
| Libellé | `libelle` | texte (200) | oui | — |
| Compte | `lignes[].compte_id` | sélecteur → `comptes` | oui | imputable (`comptes.est_imputable`) |
| Tiers | `lignes[].tiers_id` | sélecteur → `tiers` | — | obligatoire si le compte est collectif (`comptes.est_collectif`) |
| Libellé de la ligne | `lignes[].libelle` | texte (200) | oui | proposé : celui de l'entête |
| Débit | `lignes[].debit` | montant | — | une ligne porte un débit **ou** un crédit, jamais les deux |
| Crédit | `lignes[].credit` | montant | — | — |
| Échéance | `lignes[].date_echeance` | date | — | — |
| Campagne | `lignes[].campagne_id` | sélecteur → `campagnes` | — | axe d'analyse : sans lui, la ligne manque au résultat de campagne |

**Rempli par le serveur** : `exercice_id`, `periode_id`, `numero_piece`, `total_debit`, `total_credit`.

- **Le serveur** : trouve l'exercice et la période de la date, attribue le numéro de pièce du journal, pose `est_automatique` à 0.
- **Refus** :
  - `ECRITURE_DESEQUILIBREE` (422) — Total des débits différent du total des crédits : le bouton reste désactivé tant que l'écart affiché n'est pas nul.
  - `PERIODE_CLOTUREE` — La date tombe dans une période clôturée.
  - `TIERS_REQUIS` (422) — Compte collectif sans tiers.
- **Aussi** :
  - Modifier : `PUT ecritures/{id}` — tant que `statut` = `brouillard` et que l'écriture est manuelle ; `lignes` remplace la liste

#### CO-24 · Valider une écriture

- **Permission** : `comptabilite.ecriture.valider`
- **Où** : bouton « Valider » de la fiche, ou validation groupée des écritures cochées · confirmation (`default-confirm`)
- **État** (`ecritures.statut`) : `brouillard` → `validee`
- **Envoi** : `POST ecritures/{id}/valider`
- **Le serveur** : renseigne `validee_par` et `date_validation` ; l'écriture entre dans le grand livre, la balance et les états.
- **Refus** :
  - `PERIODE_CLOTUREE` — La période de l'écriture est clôturée.

#### CO-25 · Extourner une écriture

- **Permission** : `comptabilite.ecriture.extourner`
- **Où** : menu « Plus » de la fiche d'une écriture manuelle `validee` · dialogue de motif (`default-prompt`)
- **Envoi** : `POST ecritures/{id}/extourner`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date de l'extourne | `date_ecriture` | date | oui | défaut : aujourd'hui ; dans une période `ouverte` |
| Motif | `motif` | texte (200) | oui | repris dans le libellé de l'écriture inverse |

- **Le serveur** : crée l'écriture inverse (`ecriture_extournee_id`) : mêmes comptes, débit et crédit échangés.
- **Refus** :
  - `ECRITURE_AUTOMATIQUE` — Une écriture automatique s'annule depuis son opération d'origine.
  - `ECRITURE_DEJA_EXTOURNEE` — Cette écriture a déjà son inverse.

### 10.23 Grand livre — `/comptabilite/generale/grand-livre`

**Lecture** · `comptabilite.livre.voir` · `GET grand-livre?compte_id=57&du=2026-01-01&au=2026-03-31`

Lecture seule (`v_grand_livre`) : toutes les lignes des écritures validées d'un compte, avec le solde progressif.

### 10.24 Balance générale — `/comptabilite/generale/balance`

**Lecture** · `comptabilite.livre.voir` · `GET balance-generale?exercice_id=1`

Lecture seule (`v_balance_generale`) : totaux et soldes de chaque compte. Le total des débits égale celui des crédits.

### 10.25 Balance des tiers — `/comptabilite/generale/balance-tiers`

**Lecture** · `comptabilite.livre.voir` · `GET balance-tiers?exercice_id=1`

Lecture seule (`v_balance_tiers`) : ce que l'entreprise doit à chaque producteur ou fournisseur, ce que chaque client lui doit.

### 10.26 Lettrage — `/comptabilite/generale/lettrage`

**Lecture** · `comptabilite.lettrage.voir` · `GET ecriture-lignes?non_lettrees=1` · filtres : `compte_id`, `tiers_id`

Pour un compte lettrable et un tiers : les lignes non lettrées, débits à gauche, crédits à droite.

#### CO-26 · Lettrer des lignes

- **Permission** : `comptabilite.lettrage.saisir`
- **Où** : bouton « Lettrer » quand des lignes sont cochées · formulaire en page
- **Envoi** : `POST lettrages`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Compte | `compte_id` | sélecteur → `comptes` | oui | lettrable (`comptes.est_lettrable`) |
| Tiers | `tiers_id` | sélecteur → `tiers` | — | — |
| Date | `date_lettrage` | date | oui | défaut : aujourd'hui |
| Lignes cochées | `ligne_ids` | tableau d'identifiants de `ecriture_lignes` | oui | au moins un débit et un crédit |

**Rempli par le serveur** : `code`, `lettre_par`.

- **Le serveur** : attribue le code de lettrage (`AAA`, `AAB`…), le pose sur les lignes (`ecriture_lignes.lettrage_id`) ; `est_partiel` si débits et crédits ne s'annulent pas.
- **Aussi** :
  - Délettrer : `POST lettrages/{id}/annuler` — retire le code des lignes

> **Section « Clôtures et états »** · `/comptabilite/clotures/…` — section fermée (`status: 'soon'`), décrite pour mémoire

### 10.27 Exercices et périodes — `/comptabilite/clotures/exercices`

**Lecture** · `comptabilite.exercice.voir` · `GET exercices` · `GET periodes` · filtres : `exercice_id`, `statut`

Un exercice et ses douze mois. Clôturer un mois interdit toute opération datée de ce mois, dans toutes les applications : c'est l'origine du refus `PERIODE_CLOTUREE`.

#### CO-27 · Clôturer une période ou un exercice

- **Permission** : `comptabilite.exercice.cloturer`
- **Où** : bouton « Clôturer » d'un mois ; « Clôturer l'exercice » quand ses douze mois le sont · confirmation (`default-confirm`)
- **État** : `periodes.statut` `ouverte` → `cloturee` (Clôturer le mois) · `periodes.statut` `cloturee` → `ouverte` (Rouvrir le mois) · `exercices.statut` (création) → `ouvert` (Ouvrir un exercice) · `exercices.statut` `ouvert` → `cloture` (Clôturer l'exercice)
- **Envoi** : `POST periodes/{id}/cloturer`
- **Refus** :
  - `ECRITURES_EN_BROUILLARD` — Il reste des écritures non validées dans la période.
  - `PERIODES_OUVERTES` — Clôture de l'exercice refusée tant qu'un mois est ouvert.
  - `INVENTAIRE_DE_CLOTURE_MANQUANT` — Pas d'inventaire de clôture validé pour l'exercice.
- **Aussi** :
  - Rouvrir un mois : `POST periodes/{id}/rouvrir` — tant que l'exercice est `ouvert` ; motif obligatoire
  - Ouvrir un exercice : `POST exercices` — corps `{ "code": "2027", "date_debut": "2027-01-01", "date_fin": "2027-12-31" }` ; le serveur crée ses douze périodes
  - Clôturer l'exercice : `POST exercices/{id}/cloturer` — renseigne `date_cloture` et `cloture_par` ; passe les écritures de stock et les dotations aux amortissements

### 10.28 Immobilisations — `/comptabilite/clotures/immobilisations`

**Lecture** · `comptabilite.immobilisation.voir` · `GET immobilisations` · filtres : `recherche`, `statut`, `depot_id`

**Colonnes de la liste** : `code`, `libelle`, `date_acquisition`, `valeur_acquisition`, `duree_annees`, `mode`, `statut`

La fiche d'un bien montre son tableau d'amortissement (`amortissements`) : base, dotation, cumul, valeur nette, par exercice.

#### CO-28 · Enregistrer une immobilisation

- **Permission** : `comptabilite.immobilisation.saisir`
- **Où** : formulaire en dialogue
- **État** (`immobilisations.statut`) : (création) → `en_service` (Enregistrer) · `en_service` → `cedee` (Céder) · `en_service` → `rebut` (Mettre au rebut)
- **Envoi** : `POST immobilisations`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Désignation | `libelle` | texte (150) | oui | « Bascule 500 kg », « Séchoir » |
| Compte d'immobilisation | `compte_immobilisation_id` | sélecteur → `comptes` | oui | classe 2 |
| Compte d'amortissement | `compte_amortissement_id` | sélecteur → `comptes` | oui | 28… |
| Compte de dotation | `compte_dotation_id` | sélecteur → `comptes` | oui | 681 |
| Date d'acquisition | `date_acquisition` | date | oui | — |
| Mise en service | `date_mise_en_service` | date | — | point de départ de l'amortissement |
| Valeur d'acquisition | `valeur_acquisition` | montant | oui | — |
| Durée | `duree_annees` | entier | oui | en années |
| Mode d'amortissement | `mode` | liste : `lineaire` · `degressif` | — | — |
| Dépôt | `depot_id` | sélecteur → `depots` | — | où se trouve le bien |
| Fournisseur | `fournisseur_id` | sélecteur → `fournisseurs` | — | — |
| Dossier d'import | `dossier_import_id` | sélecteur → `dossiers_import` | — | si le bien a été importé : son coût rendu est proposé comme valeur |

**Rempli par le serveur** : `code`.

- **Aussi** :
  - Sortir un bien : `POST immobilisations/{id}/sortir` — corps `{ "date_sortie": "…", "prix_cession": "…" }` ; `prix_cession` vide : mise au rebut
  - Calculer les dotations de l'exercice : `POST exercices/{id}/amortissements` — écrit `amortissements` (une ligne par bien) ; l'écriture `AMORTISSEMENT` passe à la clôture

### 10.29 États financiers — `/comptabilite/clotures/etats-financiers`

**Lecture** · `comptabilite.etat.voir` · `GET etats-financiers` · `GET etat-postes` · filtres : `etat_financier_id`, `type`

Bilan actif, bilan passif, compte de résultat, tableau des flux. `GET etats-financiers/{id}/calcul?exercice_id=1` renvoie chaque poste et son montant, calculé d'après `etat_poste_comptes`.

#### CO-29 · Paramétrer un poste d'état financier

- **Permission** : `comptabilite.etat.parametrer`
- **Où** : formulaire en dialogue
- **Envoi** : `PUT etat-postes/{id}`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Libellé | `libelle` | texte (200) | oui | — |
| Ordre | `ordre` | entier | oui | — |
| Type | `type` | liste : `detail` · `total` | — | — |
| Formule | `formule` | texte (255) | — | pour un total : références des postes, `TA-RA-RB` |
| Racine de compte | `comptes[].racine_compte` | texte (12) | oui | `601` : tous les comptes qui commencent par 601 |
| Montant à prendre | `comptes[].mode_solde` | liste : `solde` · `solde_debiteur` · `solde_crediteur` · `mouvement_debit` · `mouvement_credit` | — | — |
| Signe | `comptes[].signe` | liste : `plus` · `moins` | — | — |
| Colonne | `comptes[].colonne` | liste : `brut` · `amortissement` | — | bilan actif seulement |

- **Refus** :
  - `FORMULE_INVALIDE` (422) — La formule cite une référence de poste inconnue.

> **Section « Paramétrage comptable »** · `/comptabilite/parametrage/…` — section fermée (`status: 'soon'`), décrite pour mémoire

### 10.30 Plan de comptes — `/comptabilite/parametrage/plan-comptes`

**Lecture** · `comptabilite.compte.voir` · `GET comptes` · filtres : `recherche`, `classe`, `est_actif`, `est_imputable`

**Colonnes de la liste** : `numero`, `intitule`, `classe`, `sens_normal`, `est_collectif`, `est_lettrable`, `est_imputable`, `est_actif`

#### CO-30 · Créer ou modifier un compte

- **Permission** : `comptabilite.compte.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `POST comptes`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Numéro | `numero` | texte (12) | oui | chiffres seulement ; son premier chiffre donne la classe |
| Intitulé | `intitule` | texte (150) | oui | — |
| Classe | `classe` | entier | oui | déduite du numéro, en lecture seule |
| Compte de regroupement | `compte_parent_id` | sélecteur → `comptes` | — | proposé : le compte dont le numéro est le début de celui-ci |
| Sens normal | `sens_normal` | liste : `debit` · `credit` | oui | — |
| Compte collectif | `est_collectif` | case à cocher | — | 401, 411, 421 : le détail est porté par les tiers |
| Lettrable | `est_lettrable` | case à cocher | — | — |
| Imputable | `est_imputable` | case à cocher | — | décochée : compte de regroupement, sans écriture directe |
| Actif | `est_actif` | case à cocher | — | — |

- **Refus** :
  - `NUMERO_DEJA_UTILISE` — Ce numéro existe déjà.
- **Aussi** :
  - Modifier : `PUT comptes/{id}` — le numéro ne change plus dès qu'une écriture l'utilise

### 10.31 Journaux — `/comptabilite/parametrage/journaux`

**Lecture** · `comptabilite.journal.voir` · `GET journaux`

**Colonnes de la liste** : `code`, `libelle`, `type`, `compte_tresorerie_id`, `est_actif`

#### CO-31 · Créer ou modifier un journal

- **Permission** : `comptabilite.journal.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `POST journaux`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (10) | oui | `ACH`, `VTE`, `CAI`, `BNQ`, `MOB`, `PAI`, `OD`, `AN` |
| Libellé | `libelle` | texte (100) | oui | — |
| Type | `type` | liste : `achats` · `ventes` · `tresorerie` · `paie` · `operations_diverses` · `a_nouveaux` | oui | — |
| Caisse ou banque du journal | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | — | pour un journal de type `tresorerie` |
| Actif | `est_actif` | case à cocher | — | — |

- **Aussi** :
  - Modifier : `PUT journaux/{id}`

### 10.32 Tiers — `/comptabilite/parametrage/tiers`

**Lecture** · `comptabilite.tiers.voir` · `GET tiers` · filtres : `recherche`, `type`

**Colonnes de la liste** : `code`, `type`, `libelle`, `compte_collectif_id`

Les tiers des producteurs, des clients, des fournisseurs et des employés se créent **tout seuls** avec leur fiche. Seuls les autres (État, organismes sociaux) se saisissent ici.

#### CO-32 · Créer un tiers

- **Permission** : `comptabilite.tiers.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `POST tiers`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Type | `type` | liste : `producteur` · `client` · `fournisseur` · `employe` · `etat` · `organisme_social` · `autre` | oui | limité à `etat`, `organisme_social` et `autre` |
| Libellé | `libelle` | texte (150) | oui | — |
| Compte collectif | `compte_collectif_id` | sélecteur → `comptes` | oui | — |

**Rempli par le serveur** : `code`.

- **Aussi** :
  - Modifier : `PUT tiers/{id}` — libellé et compte collectif

### 10.33 Modèles d'écritures — `/comptabilite/parametrage/modeles-ecritures`

**Lecture** · `comptabilite.modele.voir` · `GET schemas-comptables`

**Colonnes de la liste** : `code`, `libelle`, `origine_table`, `declencheur`, `journal_id`, `est_actif`

Un modèle par événement (`AVANCE_VERSEMENT`, `PESEE_ACHAT`, `FACTURE_VENTE`…). On en règle les comptes ; on n'en crée pas : un modèle n'existe que si le code le déclenche.

#### CO-33 · Régler un modèle d'écriture

- **Permission** : `comptabilite.modele.saisir`
- **Où** : formulaire en page
- **Envoi** : `PUT schemas-comptables/{id}`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Libellé | `libelle` | texte (150) | oui | — |
| Journal | `journal_id` | sélecteur → `journaux` | — | vide : le journal de la caisse ou de la banque utilisée |
| Actif | `est_actif` | case à cocher | — | — |
| Ordre | `lignes[].ordre` | entier | oui | — |
| Sens | `lignes[].sens` | liste : `debit` · `credit` | oui | — |
| D'où vient le compte | `lignes[].source_compte` | liste : `fixe` · `tresorerie` · `produit_achat` · `produit_vente` · `produit_stock` · `produit_variation` · `nature_depense` · `rubrique_debit` · `rubrique_credit` · `taxe_collectee` · `taxe_deductible` · `immo_dotation` · `immo_amortissement` | oui | — |
| Compte | `lignes[].compte_id` | sélecteur → `comptes` | — | obligatoire quand la source est `fixe` |
| Montant pris dans | `lignes[].champ_montant` | texte (40) | oui | colonne de l'opération, en lecture seule |
| Porte le tiers | `lignes[].a_tiers` | case à cocher | — | — |
| Libellé de la ligne | `lignes[].libelle_modele` | texte (150) | oui | — |

- **Le serveur** : ne vaut que pour les écritures à venir ; celles déjà passées ne changent pas.

### 10.34 Comptes par produit — `/comptabilite/parametrage/comptes-produits`

**Lecture** · `comptabilite.compte.voir` · `GET produit-comptes`

Une ligne par produit : comptes d'achat, de vente, de stock et de variation de stock.

#### CO-34 · Régler les comptes d'un produit

- **Permission** : `comptabilite.compte.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `PUT produit-comptes/{id}`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Compte d'achat | `compte_achat_id` | sélecteur → `comptes` | oui | 601 |
| Compte de vente | `compte_vente_id` | sélecteur → `comptes` | oui | 701 |
| Compte de stock | `compte_stock_id` | sélecteur → `comptes` | oui | 31 |
| Compte de variation de stock | `compte_variation_id` | sélecteur → `comptes` | oui | 6031 |


### 10.35 Taxes — `/comptabilite/parametrage/taxes`

**Lecture** · `comptabilite.taxe.voir` · `GET taxes`

**Colonnes de la liste** : `code`, `libelle`, `taux`, `date_debut`, `date_fin`, `est_actif`

#### CO-35 · Créer ou modifier une taxe

- **Permission** : `comptabilite.taxe.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `POST taxes`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (20) | oui | — |
| Libellé | `libelle` | texte (100) | oui | — |
| Taux | `taux` | pourcentage | oui | à saisir avec le comptable : aucun taux n'est écrit dans le code |
| Compte de taxe facturée | `compte_collectee_id` | sélecteur → `comptes` | — | 443 |
| Compte de taxe récupérable | `compte_deductible_id` | sélecteur → `comptes` | — | 445 |
| À partir du | `date_debut` | date | oui | — |
| Jusqu'au | `date_fin` | date | — | — |
| Active | `est_actif` | case à cocher | — | — |

- **Aussi** :
  - Modifier : `PUT taxes/{id}` — un changement de taux s'ouvre par une nouvelle ligne datée, pas en corrigeant l'ancienne

---

## 11. Ressources humaines

`rh/` · préfixe `rh` · espace : Extension, hors de l'offre signée · 15 pages, 13 actions · application à ouvrir (`status: 'soon'`)

**Extension, hors de l'offre signée** : l'application reste fermée (`status: 'soon'`). Ses actions sont décrites plus brièvement, pour que les tables de la base aient déjà leur mode d'emploi le jour où elle s'ouvre.

Aucun taux de cotisation, aucun barème dans le front : tout se lit dans `rubriques_paie` et `bareme_tranches`. Un bulletin ne se calcule jamais dans le navigateur.

### 11.1 Employés — `/rh/employes`

**Liste** · `rh.employe.voir` · `GET employes` · filtres : `recherche`, `poste_id`, `zone_id`, `depot_id`, `statut`

**Colonnes de la liste** : `matricule`, `nom`, `prenom`, `telephone`, `poste_id`, `date_embauche`, `statut`

**Fiche** · `/rh/employes/:employeId` · `GET employes/{id}`

Onglets Contrat (`contrats_travail`), Primes fixes (`employe_rubriques`), Présences, Bulletins, Avances. `numero_piece` et `numero_compte` sont masqués hors de la fiche.

#### RH-01 · Créer ou modifier un employé

- **Permission** : `rh.employe.saisir`
- **Où** : formulaire en page
- **État** (`employes.statut`) : (création) → `actif` (Créer) · `actif` → `suspendu` (Suspendre) · `suspendu` → `actif` (Réactiver) · `actif` ou `suspendu` → `sorti` (Enregistrer la sortie)
- **Envoi** : `POST employes`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Nom | `nom` | texte (80) | oui | — |
| Prénom | `prenom` | texte (80) | oui | — |
| Sexe | `sexe` | liste : `M` · `F` | — | — |
| Date de naissance | `date_naissance` | date | — | — |
| Téléphone | `telephone` | téléphone (20) | oui | — |
| Adresse | `adresse` | texte (255) | — | — |
| Pièce d'identité | `type_piece` | liste : `cni` · `passeport` · `autre` | — | — |
| Numéro de la pièce | `numero_piece` | texte (50) | — | — |
| Numéro CNSS | `numero_cnss` | texte (30) | — | — |
| Poste | `poste_id` | sélecteur → `postes` | oui | — |
| Zone d'affectation | `zone_id` | sélecteur → `zones` | — | pour le personnel de terrain |
| Dépôt d'affectation | `depot_id` | sélecteur → `depots` | — | — |
| Compte de l'application | `utilisateur_id` | sélecteur → `utilisateurs` | — | s'il en a un ; un compte ne se lie qu'à un employé |
| Date d'embauche | `date_embauche` | date | oui | — |
| Mode de paiement du salaire | `mode_paiement` | liste : `virement` · `especes` · `orange_money` | — | — |
| Banque | `banque` | texte (100) | — | pour `virement` |
| Numéro du compte | `numero_compte` | texte (50) | — | pour `virement` et `orange_money` |

**Rempli par le serveur** : `matricule`.

- **Le serveur** : attribue le `matricule` et crée le compte de l'employé dans `tiers` (type `employe`).
- **Aussi** :
  - Modifier : `PUT employes/{id}`
  - Ajouter une prime ou une retenue fixe : `POST employes/{id}/rubriques` — ligne `employe_rubriques` : `rubrique_paie_id`, `montant` ou `taux`, `date_debut`, `date_fin`
  - Suspendre / réactiver : `POST employes/{id}/suspendre` — motif obligatoire ; `POST employes/{id}/reactiver` pour rouvrir
  - Enregistrer la sortie : `POST employes/{id}/sortir` — corps `{ "date_sortie": "…" }` ; clôt aussi son contrat

### 11.2 Contrats — `/rh/contrats`

**Lecture** · `rh.contrat.voir` · `GET contrats-travail` · filtres : `employe_id`, `type`, `statut`

**Colonnes de la liste** : `numero`, `employe_id`, `type`, `poste_id`, `date_debut`, `date_fin`, `salaire_base`, `periodicite`, `statut`

Les contrats dont `date_fin` approche (paramètre `ALERTE_FIN_CONTRAT_JOURS`) sont en tête ; une alerte `fin_contrat` est levée pour le gérant.

#### RH-02 · Enregistrer un contrat de travail

- **Permission** : `rh.contrat.saisir`
- **Où** : formulaire en dialogue
- **État** (`contrats_travail.statut`) : (création) → `actif` (Enregistrer) · `actif` → `termine` (Terminer) · `actif` → `rompu` (Rompre)
- **Envoi** : `POST contrats-travail`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Employé | `employe_id` | sélecteur → `employes` | oui | — |
| Type de contrat | `type` | liste : `cdi` · `cdd` · `stage` · `saisonnier` · `journalier` | oui | — |
| Poste | `poste_id` | sélecteur → `postes` | oui | prérempli avec celui de l'employé |
| Début | `date_debut` | date | oui | — |
| Fin | `date_fin` | date | — | obligatoire sauf pour un `cdi` |
| Salaire de base | `salaire_base` | montant | oui | copié sur chaque bulletin |
| Payé | `periodicite` | liste : `mensuel` · `journalier` | — | — |

**Rempli par le serveur** : `numero`.

- **Refus** :
  - `CONTRAT_DEJA_ACTIF` — L'employé a déjà un contrat `actif` sur ces dates.
- **Ensuite** : joindre le contrat signé (SE-07, `categorie` = `contrat`).
- **Aussi** :
  - Terminer ou rompre : `POST contrats-travail/{id}/terminer` — corps `{ "date_fin": "…", "motif_fin": "…", "rompu": false }`

### 11.3 Services et postes — `/rh/organisation`

**Lecture** · `rh.organisation.voir` · `GET services` · `GET postes` · filtres : `service_id`

#### RH-03 · Créer ou modifier un service ou un poste

- **Permission** : `rh.organisation.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `POST postes`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (20) | oui | — |
| Libellé | `libelle` | texte (100) | oui | — |
| Service | `service_id` | sélecteur → `services` | oui | — |

- **Aussi** :
  - Créer un service : `POST services` — champs `code` et `libelle`
  - Modifier : `PUT postes/{id}` — ou `PUT services/{id}`

### 11.4 Présences — `/rh/presences`

**Lecture** · `rh.presence.voir` · `GET presences` · filtres : `employe_id`, `statut`, `source`, `du`, `au`

**Colonnes de la liste** : `date_jour`, `employe_id`, `statut`, `heures`, `source`, `observation`

Une grille : les employés en lignes, les jours du mois en colonnes. Les jours de terrain déduits d'une visite ou d'une pesée (`source`) sont déjà remplis et marqués.

#### RH-04 · Saisir les présences d'une journée

- **Permission** : `rh.presence.saisir`
- **Où** : colonne d'un jour dans la grille, bouton « Enregistrer la journée » · formulaire en page
- **Envoi** : `POST presences`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Jour | `date_jour` | date | oui | pas dans le futur |
| Employé | `lignes[].employe_id` | sélecteur → `employes` | oui | — |
| Situation | `lignes[].statut` | liste : `present` · `absent` · `conge` · `mission` · `repos` · `ferie` | oui | — |
| Heures | `lignes[].heures` | nombre (2 déc.) | — | facultatif |
| Observation | `lignes[].observation` | texte (200) | — | — |

- **Le serveur** : une seule ligne par employé et par jour : l'envoi remplace celles de la journée ; `source` = `saisie`, `saisi_par` renseigné.
- **Refus** :
  - `PAIE_DEJA_VALIDEE` — La paie du mois est validée : les présences de ce mois ne changent plus.

### 11.5 Congés — `/rh/conges`

**Lecture** · `rh.conge.voir` · `GET conges` · `GET types-conge` · filtres : `employe_id`, `type_conge_id`, `statut`, `du`, `au`

**Colonnes de la liste** : `employe_id`, `type_conge_id`, `date_debut`, `date_fin`, `nombre_jours`, `statut`

#### RH-05 · Demander un congé

- **Permission** : `rh.conge.demander`
- **Où** : formulaire en dialogue
- **État** (`conges.statut`) : (création) → `demande` (Demander) · `demande` → `annule` (Annuler)
- **Envoi** : `POST conges`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Employé | `employe_id` | sélecteur → `employes` | oui | — |
| Type de congé | `type_conge_id` | sélecteur → `types_conge` | oui | — |
| Du | `date_debut` | date | oui | — |
| Au | `date_fin` | date | oui | après le début |
| Nombre de jours | `nombre_jours` | nombre (2 déc.) | oui | proposé à partir des dates, modifiable (demi-journées) |
| Motif | `motif` | texte (255) | — | — |

- **Aussi** :
  - Annuler une demande : `POST conges/{id}/annuler`

#### RH-06 · Décider un congé

- **Permission** : `rh.conge.decider`
- **Où** : confirmation (`default-confirm`)
- **État** (`conges.statut`) : `demande` → `approuve` (Approuver) · `demande` → `refuse` (Refuser)
- **Envoi** : `POST conges/{id}/approuver`
- **Le serveur** : renseigne `decide_par` ; approuvé, écrit les jours en `conge` dans `presences`.
- **Aussi** :
  - Refuser : `POST conges/{id}/refuser` — corps `{ "motif": "…" }`
  - Régler les types de congé : `POST types-conge` — champs `code`, `libelle`, `est_paye`, `jours_par_an`

### 11.6 Missions — `/rh/missions`

**Lecture** · `rh.mission.voir` · `GET missions` · filtres : `employe_id`, `zone_id`, `statut`, `du`, `au`

**Colonnes de la liste** : `numero`, `employe_id`, `objet`, `zone_id`, `date_debut`, `date_fin`, `frais_prevus`, `statut`

#### RH-07 · Ordonner une mission

- **Permission** : `rh.mission.saisir`
- **Où** : formulaire en dialogue
- **État** (`missions.statut`) : (création) → `planifiee` (Ordonner) · `planifiee` → `en_cours` (Démarrer) · `en_cours` → `terminee` (Terminer) · `planifiee` ou `en_cours` → `annulee` (Annuler)
- **Envoi** : `POST missions`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Employé | `employe_id` | sélecteur → `employes` | oui | — |
| Objet | `objet` | texte (200) | oui | — |
| Zone | `zone_id` | sélecteur → `zones` | — | — |
| Du | `date_debut` | date | oui | — |
| Au | `date_fin` | date | oui | — |
| Frais prévus | `frais_prevus` | montant | — | — |

**Rempli par le serveur** : `numero`, `ordonnee_par`.

- **Aussi** :
  - Démarrer : `POST missions/{id}/demarrer` — écrit les jours en `mission` dans `presences`
  - Terminer : `POST missions/{id}/terminer` — corps `{ "depense_id": 12 }` : la dépense des frais réels, saisie en Comptabilité
  - Annuler : `POST missions/{id}/annuler`

### 11.7 Paie du mois — `/rh/paie`

**Liste** · `rh.paie.voir` · `GET periodes-paie`

**Colonnes de la liste** : `annee`, `mois`, `date_debut`, `date_fin`, `statut`

**Fiche** · `/rh/paie/:periodeId` · `GET periodes-paie/{id}`

Les éléments variables du mois (`elements_variables`) et les bulletins calculés. Le bandeau du haut porte l'étape : ouverte, calculée, validée, payée, clôturée.

#### RH-08 · Ouvrir et calculer la paie d'un mois

- **Permission** : `rh.paie.calculer`
- **Où** : formulaire en page
- **État** : `periodes_paie.statut` (création) → `ouverte` (Ouvrir) · `periodes_paie.statut` `ouverte` ou `calculee` → `calculee` (Calculer) · `bulletins.statut` (création) → `calcule` (Calculer)
- **Envoi** : `POST periodes-paie`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Année | `annee` | entier | oui | — |
| Mois | `mois` | entier | oui | 1 à 12 ; une seule paie par mois |

**Rempli par le serveur** : `date_debut`, `date_fin`.

- **Le serveur** :
  - « Calculer » lit les contrats, les présences, les primes fixes, les éléments variables, les rubriques et le barème, puis écrit un bulletin par employé (`bulletins`, `bulletin_lignes`) et les retenues d'avance (`avance_salaire_retenues`) ;
  - recalculable tant que la paie n'est pas validée : les bulletins `calcule` sont remplacés.
- **Aussi** :
  - Ajouter un élément variable : `POST elements-variables` — champs `periode_paie_id`, `employe_id`, `rubrique_paie_id`, `quantite`, `montant`, `motif`
  - Calculer : `POST periodes-paie/{id}/calculer` — sans corps

#### RH-09 · Valider la paie d'un mois

- **Permission** : `rh.paie.valider`
- **Où** : confirmation (`default-confirm`)
- **État** : `periodes_paie.statut` `calculee` → `validee` (Valider) · `bulletins.statut` `calcule` → `valide` (Valider) · `periodes_paie.statut` `payee` → `cloturee` (Clôturer)
- **Envoi** : `POST periodes-paie/{id}/valider`
- **Le serveur** : renseigne `validee_par` (le gérant) ; les bulletins passent en lecture seule ; passe l'écriture `PAIE_VALIDATION` ; émet les bulletins en PDF.
- **Refus** :
  - `DEMANDEUR_EGAL_DECIDEUR` (403) — Celui qui a calculé la paie ne la valide pas.
- **Aussi** :
  - Clôturer la paie : `POST periodes-paie/{id}/cloturer` — quand tous les bulletins sont payés

### 11.8 Bulletins — `/rh/bulletins`

**Liste** · `rh.bulletin.voir` · `GET bulletins` · filtres : `periode_paie_id`, `employe_id`, `statut`

**Colonnes de la liste** : `numero`, `periode_paie_id`, `employe_id`, `salaire_base`, `total_gains`, `total_retenues`, `net_a_payer`, `montant_paye`, `statut`

**Fiche** · `/rh/bulletins/:bulletinId` · `GET bulletins/{id}`

Lecture seule : lignes du bulletin (`bulletin_lignes`), net à payer, paiements. Le PDF se lit par SE-09.

### 11.9 Avances sur salaire — `/rh/avances-salaire`

**Lecture** · `rh.avance-salaire.voir` · `GET avances-salaire` · filtres : `employe_id`, `statut`

**Colonnes de la liste** : `numero`, `employe_id`, `date_avance`, `montant`, `nombre_echeances`, `montant_rembourse`, `statut`

#### RH-10 · Demander une avance sur salaire

- **Permission** : `rh.avance-salaire.saisir`
- **Où** : formulaire en dialogue
- **État** (`avances_salaire.statut`) : (création) → `demandee`
- **Envoi** : `POST avances-salaire`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Employé | `employe_id` | sélecteur → `employes` | oui | — |
| Date | `date_avance` | date | oui | — |
| Montant | `montant` | montant | oui | — |
| Motif | `motif` | texte (200) | — | — |
| Remboursée en | `nombre_echeances` | entier | — | nombre de bulletins sur lesquels la retenue est étalée |
| Mode de paiement souhaité | `mode_paiement` | liste : `especes` · `orange_money` · `virement` | oui | — |

**Rempli par le serveur** : `numero`.


#### RH-11 · Décider une avance sur salaire

- **Permission** : `rh.avance-salaire.decider`
- **Où** : confirmation (`default-confirm`)
- **État** (`avances_salaire.statut`) : `demandee` → `approuvee` (Approuver) · `demandee` → `refusee` (Refuser)
- **Envoi** : `POST avances-salaire/{id}/approuver`
- **Le serveur** : renseigne `decide_par`.
- **Aussi** :
  - Refuser : `POST avances-salaire/{id}/refuser` — corps `{ "motif": "…" }`

### 11.10 Paiement des salaires — `/rh/paiements`

**Lecture** · `rh.salaire.voir` · `GET paiements-salaires` · `GET bulletins?statut=valide` · filtres : `bulletin_id`, `mode_paiement`, `du`, `au`

**Colonnes de la liste** : `numero`, `date_paiement`, `bulletin_id`, `montant`, `mode_paiement`, `reference_paiement`

En haut, les bulletins `valide` à payer : la liste ne contient que ceux d'une paie validée. En dessous, les paiements faits.

#### RH-12 · Payer un salaire

- **Permission** : `rh.salaire.payer`
- **Où** : formulaire en dialogue
- **État** : `bulletins.statut` `valide` → `paye` (Payer) · `avances_salaire.statut` `approuvee` → `versee` (Verser une avance sur salaire)
- **Envoi** : `POST bulletins/{id}/payer`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Date du paiement | `date_paiement` | date | oui | défaut : aujourd'hui |
| Montant | `montant` | montant | oui | prérempli : net à payer − déjà payé |
| Mode de paiement | `mode_paiement` | liste : `virement` · `especes` · `orange_money` | oui | prérempli avec celui de l'employé |
| Compte de trésorerie | `compte_tresorerie_id` | sélecteur → `comptes_tresorerie` | oui | — |
| Référence | `reference_paiement` | texte (50) | — | — |
| (créée par le navigateur) | `reference_unique` | aucun champ | oui | `nouvelleReferenceUnique()` à l'ouverture du dialogue |

**Rempli par le serveur** : `numero`, `bulletin_id`, `paye_par`.

- **Le serveur** : écrit `paiements_salaires`, la sortie dans `mouvements_tresorerie` (nature `salaire`) et l'écriture `SALAIRE_PAIEMENT`.
- **Refus** :
  - `PAIE_NON_VALIDEE` — Pas de salaire payé sans paie validée par le gérant.
  - `MONTANT_SUPERIEUR_AU_RESTE` — Le montant dépasse le net restant.
  - `SOLDE_INSUFFISANT` — Le compte de trésorerie n'a pas ce solde.
- **Aussi** :
  - Verser une avance sur salaire approuvée : `POST avances-salaire/{id}/verser` — même formulaire de paiement (`compte_tresorerie_id`, `mode_paiement`, `reference_unique`) ; mouvement de nature `avance_salaire`, écriture `AVANCE_SALAIRE`

> Formulaire commun `shared/metier/paiement-form/`.

### 11.11 Rubriques et barème — `/rh/rubriques`

**Lecture** · `rh.rubrique.voir` · `GET rubriques-paie` · filtres : `type`, `est_actif`

**Colonnes de la liste** : `ordre`, `code`, `libelle`, `type`, `mode_calcul`, `taux`, `base_calcul`, `est_imposable`, `est_actif`

#### RH-13 · Régler une rubrique de paie et son barème

- **Permission** : `rh.rubrique.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `POST rubriques-paie`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (20) | oui | `BASE`, `PRIME_TERRAIN`, `CNSS_SAL`… |
| Libellé | `libelle` | texte (120) | oui | — |
| Type | `type` | liste : `gain` · `retenue` · `cotisation_salariale` · `cotisation_patronale` | oui | — |
| Mode de calcul | `mode_calcul` | liste : `fixe` · `pourcentage` · `bareme` · `saisie` | oui | — |
| Taux | `taux` | pourcentage | — | pour `pourcentage` ; à saisir avec le comptable |
| Calculé sur | `base_calcul` | liste : `salaire_base` · `brut` · `brut_imposable` | — | pour `pourcentage` et `bareme` |
| Plafond | `plafond` | montant | — | — |
| Imposable | `est_imposable` | case à cocher | — | — |
| Compte de débit | `compte_debit_id` | sélecteur → `comptes` | — | — |
| Compte de crédit | `compte_credit_id` | sélecteur → `comptes` | — | — |
| Ordre sur le bulletin | `ordre` | entier | — | — |
| Active | `est_actif` | case à cocher | — | — |

- **Aussi** :
  - Modifier : `PUT rubriques-paie/{id}`
  - Ouvrir un barème à partir d'une date : `POST rubriques-paie/{id}/tranches` — corps `{ "date_debut": "…", "tranches": [{ "borne_min": "…", "borne_max": "…", "taux": "…" }] }` ; lignes de `bareme_tranches`, valeur datée

### 11.12 Rapports — `/rh/rapports`

**Lecture** · `rh.rapport.voir` · `GET employes` · `GET presences` · `GET bulletins`

Lecture seule : effectif, présences du mois, journal de paie.

---

## 12. Administration

`administration/` · préfixe `ad` · espace : Administrateur (gérant) · 15 pages, 14 actions · application ouverte

Première application à livrer (`status: 'open'`) : rien ne se saisit ailleurs tant que les produits, les zones, les dépôts, la campagne, les prix et les comptes n'existent pas.

Trois familles de formulaires : les **fiches** (utilisateur, zone, dépôt), qui se modifient et se désactivent ; les **valeurs datées** (règles, prix, paramètres, taux), où l'on ouvre une nouvelle valeur au lieu de corriger l'ancienne ; les **journaux** (audit, connexions, documents), en lecture seule.

### 12.1 Utilisateurs — `/administration/utilisateurs`

**Liste** · `administration.utilisateur.voir` · `GET utilisateurs` · filtres : `recherche`, `role_id`, `est_actif`

**Colonnes de la liste** : `nom`, `prenom`, `telephone`, `role_id`, `est_actif`, `derniere_connexion`

`recherche` porte sur le nom, le prénom et le téléphone. La réponse ne contient jamais `mot_de_passe`.

**Fiche** · `/administration/utilisateurs/:utilisateurId` · `GET utilisateurs/{id}`

La fiche renvoie aussi `perimetres` (lignes de `utilisateur_perimetres`) et, pour un producteur, la fiche `producteurs` liée.

#### AD-01 · Créer un utilisateur

- **Permission** : `administration.utilisateur.saisir`
- **Où** : bouton « Nouvel utilisateur » de la liste · formulaire en dialogue
- **Avant la saisie** : `GET roles` — liste des rôles ; `GET zones?niveau=zone` — périmètre d'un superviseur ; `GET depots` — périmètre d'un responsable de dépôt
- **Envoi** : `POST utilisateurs`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Rôle | `role_id` | sélecteur → `roles` | oui | décide des champs de périmètre affichés |
| Nom | `nom` | texte (80) | oui | — |
| Prénom | `prenom` | texte (80) | oui | — |
| Téléphone | `telephone` | téléphone (20) | oui | identifiant de connexion ; format `+224` puis 9 chiffres ; un seul compte actif par numéro |
| Courriel | `email` | courriel (150) | — | — |
| Zone | `perimetres[].zone_id` | sélecteur → `zones` | — | obligatoire pour le rôle `SUPERVISEUR` ; une ligne par zone |
| Dépôt | `perimetres[].depot_id` | sélecteur → `depots` | — | obligatoire pour le rôle `TRAITEMENT` ; une ligne par dépôt |
| Producteur | `producteur_id` | sélecteur → `producteurs` | — | obligatoire pour le rôle `PRODUCTEUR` : le serveur renseigne `producteurs.utilisateur_id` |

**Rempli par le serveur** : `mot_de_passe`.

```json
{
  "role_id": 3, "nom": "Démo", "prenom": "Superviseur", "telephone": "+2246XXXXXXXX", "email": null,
  "perimetres": [{ "zone_id": 17 }]
}
```

Réponse (extrait) :

```json
{ "id": 3, "role_id": 3, "nom": "Démo", "prenom": "Superviseur", "telephone": "+2246XXXXXXXX", "est_actif": true,
  "est_mot_de_passe_provisoire": true, "mot_de_passe_provisoire": "KOL-4821" }
```

- **Le serveur** :
  - crée le compte avec `est_actif` = 1 et `est_mot_de_passe_provisoire` = 1 ; écrit `utilisateur_perimetres` ;
  - génère un mot de passe provisoire, renvoyé **une seule fois** dans `mot_de_passe_provisoire`.
- **Refus** :
  - `TELEPHONE_DEJA_UTILISE` — Un compte actif porte déjà ce numéro.
  - `PERIMETRE_REQUIS` — Rôle de terrain ou de dépôt sans zone ni dépôt.
  - `PRODUCTEUR_DEJA_LIE` — Ce producteur a déjà un compte (`producteurs.utilisateur_id` est unique).
- **Ensuite** : `default-alert` affiche le mot de passe provisoire à remettre à la personne ; il n'est plus consultable ensuite.
- **Aussi** :
  - Modifier le rôle, l'identité ou le périmètre : `PUT utilisateurs/{id}` — mêmes champs ; `perimetres` remplace la liste entière
  - Réinitialiser le mot de passe : `POST utilisateurs/{id}/reinitialiser-mot-de-passe` — renvoie un nouveau `mot_de_passe_provisoire` ; `est_mot_de_passe_provisoire` repasse à 1
  - Désactiver : `POST utilisateurs/{id}/desactiver` — `est_actif` passe à 0 : le compte ne peut plus se connecter, ses opérations passées gardent son nom
  - Réactiver : `POST utilisateurs/{id}/reactiver`

### 12.2 Rôles et droits — `/administration/roles`

**Lecture** · `administration.role.voir` · `GET roles` · `GET permissions`

`GET roles/{id}` renvoie le rôle et `permission_ids`. L'écran est une grille : les permissions en lignes, regroupées par `permissions.module`, les rôles en colonnes.

#### AD-02 · Créer ou modifier un rôle et ses droits

- **Permission** : `administration.role.saisir`
- **Où** : bouton « Nouveau rôle », ou case cochée dans la grille des droits · formulaire en page
- **Envoi** : `POST roles`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (30) | oui | majuscules sans espace : `MAGASINIER` ; non modifiable ensuite |
| Libellé | `libelle` | texte (100) | oui | — |
| Description | `description` | texte (255) | — | — |
| Droits | `permission_ids` | tableau d'identifiants de `permissions` | — | cases à cocher regroupées par application |

- **Le serveur** :
  - écrit `roles` (`est_systeme` = 0) et `role_permissions` ;
  - les utilisateurs du rôle reçoivent leurs nouveaux droits à leur prochaine requête `GET auth/me`.
- **Refus** :
  - `ROLE_SYSTEME` — Le code d'un rôle livré (`est_systeme` = 1) ne se modifie pas ; ses droits, oui.
  - `CODE_DEJA_UTILISE` — Un autre rôle porte ce code.
- **Aussi** :
  - Modifier : `PUT roles/{id}` — `permission_ids` remplace la liste entière

> Les codes livrés par la base : `ADMIN`, `COMPTABLE`, `SUPERVISEUR`, `PRODUCTEUR`, `TRAITEMENT`, `VENTES`, `IMPORT_EXPORT`. La table `permissions` ne se saisit pas : elle suit le code (§15).

### 12.3 Produits et règles — `/administration/produits`

**Liste** · `administration.produit.voir` · `GET produits`

**Colonnes de la liste** : `code`, `nom`, `mois_debut_saison`, `mois_fin_saison`, `poids_sac_kg`, `est_actif`

**Fiche** · `/administration/produits/:produitId` · `GET produits/{id}`

Trois onglets : Règles (`produit_regles`), Prix d'achat (`prix_achats`), Étapes de traitement (`produit_etapes`). Chaque onglet montre la valeur en vigueur et l'historique.

#### AD-03 · Créer ou modifier un produit

- **Permission** : `administration.produit.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `POST produits`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (20) | oui | majuscules : `CAJOU`, `CACAO`, `CAFE`, `KARITE` |
| Nom | `nom` | texte (80) | oui | — |
| Début de saison | `mois_debut_saison` | entier | — | liste des 12 mois (1 à 12) |
| Fin de saison | `mois_fin_saison` | entier | — | liste des 12 mois |
| Poids habituel d'un sac | `poids_sac_kg` | poids en kg | — | sert au contrôle de vraisemblance d'une pesée |
| Actif | `est_actif` | case à cocher | — | — |

- **Refus** :
  - `CODE_DEJA_UTILISE` — Un autre produit porte ce code.
- **Aussi** :
  - Modifier : `PUT produits/{id}` — le `code` ne change plus dès qu'une campagne l'utilise

#### AD-04 · Ouvrir de nouvelles règles à partir d'une date

- **Permission** : `administration.produit.saisir`
- **Où** : onglet Règles, bouton « Nouvelles règles à partir du… » · formulaire en dialogue
- **Envoi** : `POST produits/{id}/regles`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| À partir du | `date_debut` | date | oui | aujourd'hui ou plus tard ; une seule ligne par produit et par date |
| Humidité maximale à l'achat | `humidite_max_achat` | pourcentage | oui | au-dessus, le paiement de la pesée est bloqué |
| Humidité de vente | `humidite_vente` | pourcentage | oui | cible du séchage |
| Perte normale, minimum | `perte_norme_min` | pourcentage | oui | — |
| Perte normale, maximum | `perte_norme_max` | pourcentage | oui | supérieure ou égale au minimum |
| Seuil de blocage | `perte_seuil_blocage` | pourcentage | oui | supérieur ou égal à la perte normale maximum ; au-dessus, le lot est bloqué |

**Rempli par le serveur** : `produit_id`.

```json
{
  "date_debut": "2026-01-01", "humidite_max_achat": "16.00", "humidite_vente": "9.00",
  "perte_norme_min": "4.00", "perte_norme_max": "8.00", "perte_seuil_blocage": "10.00"
}
```

- **Le serveur** :
  - ferme la ligne précédente (`date_fin` = veille de la nouvelle `date_debut`) et insère la nouvelle ;
  - les pesées et les lots déjà enregistrés gardent les valeurs de leur date.
- **Refus** :
  - `DATE_DEJA_UTILISEE` — Des règles commencent déjà à cette date pour ce produit.
  - `DATE_DANS_LE_PASSE` — Une valeur datée ne s'ouvre pas avant aujourd'hui.

> Les pourcentages de l'exemple sont des valeurs d'illustration : les vraies sont à fixer avec le client.

#### AD-05 · Fixer un prix d'achat à partir d'une date

- **Permission** : `administration.produit.saisir`
- **Où** : onglet Prix d'achat, bouton « Nouveau prix à partir du… » · formulaire en dialogue
- **Envoi** : `POST produits/{id}/prix`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Zone | `zone_id` | sélecteur → `zones` | — | vide : prix valable partout ; sinon le prix de cette zone l'emporte |
| À partir du | `date_debut` | date | oui | aujourd'hui ou plus tard |
| Prix au kilo | `prix_kg` | montant | oui | en GNF ; supérieur à 0 |

**Rempli par le serveur** : `produit_id`.

```json
{
  "zone_id": null, "date_debut": "2026-01-01", "prix_kg": "6000.00"
}
```

- **Le serveur** :
  - ferme le prix précédent du même produit et de la même zone, insère le nouveau ;
  - une pesée lit le prix de **sa** date : celui de sa zone s'il existe, sinon le prix général.
- **Refus** :
  - `DATE_DANS_LE_PASSE` — Une valeur datée ne s'ouvre pas avant aujourd'hui.

#### AD-06 · Définir les étapes de traitement

- **Permission** : `administration.produit.saisir`
- **Où** : onglet Étapes, liste ordonnable · formulaire en page
- **Envoi** : `PUT produits/{id}/etapes`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Ordre | `etapes[].ordre` | entier | oui | 1, 2, 3… sans trou ni doublon |
| Code | `etapes[].code` | texte (30) | oui | `SECHAGE`, `TRI` |
| Libellé | `etapes[].libelle` | texte (80) | oui | — |
| Obligatoire | `etapes[].est_obligatoire` | case à cocher | — | un lot n'est prêt à vendre qu'après ses étapes obligatoires |

```json
{
  "etapes": [
    { "ordre": 1, "code": "SECHAGE", "libelle": "Séchage", "est_obligatoire": true },
    { "ordre": 2, "code": "TRI", "libelle": "Tri", "est_obligatoire": true }
  ]
}
```

- **Refus** :
  - `ETAPE_UTILISEE` — Une étape déjà utilisée par un traitement ne se retire pas : on peut la renommer ou la rendre facultative.

### 12.4 Campagnes — `/administration/campagnes`

**Lecture** · `administration.campagne.voir` · `GET campagnes` · filtres : `produit_id`, `statut`

**Colonnes de la liste** : `code`, `libelle`, `produit_id`, `date_debut`, `date_fin`, `objectif_kg`, `statut`

#### AD-07 · Créer ou modifier une campagne

- **Permission** : `administration.campagne.saisir`
- **Où** : formulaire en dialogue
- **État** (`campagnes.statut`) : (création) → `preparation`
- **Envoi** : `POST campagnes`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Produit | `produit_id` | sélecteur → `produits` | oui | — |
| Code | `code` | texte (30) | oui | proposé : code du produit, tiret, année (`CAJOU-2026`) |
| Libellé | `libelle` | texte (100) | oui | proposé : « Cajou 2026 » |
| Début | `date_debut` | date | oui | — |
| Fin | `date_fin` | date | oui | après le début |
| Objectif de collecte | `objectif_kg` | poids en kg | — | objectif global ; le détail par zone se fixe dans Pilotage (PI-01) |

```json
{
  "produit_id": 1, "code": "CAJOU-2026", "libelle": "Cajou 2026", "date_debut": "2025-12-01",
  "date_fin": "2026-07-31", "objectif_kg": "412000.000"
}
```

- **Refus** :
  - `CODE_DEJA_UTILISE` — Une autre campagne porte ce code.
- **Aussi** :
  - Modifier : `PUT campagnes/{id}` — tant que la campagne n'est pas `cloturee` ; le produit ne change plus après la première opération

> L'objectif de l'exemple est une valeur d'illustration.

#### AD-08 · Ouvrir ou clôturer une campagne

- **Permission** : `administration.campagne.saisir`
- **Où** : boutons « Ouvrir la campagne » et « Clôturer la campagne » de la ligne · confirmation (`default-confirm`)
- **État** (`campagnes.statut`) : `preparation` → `ouverte` (Ouvrir) · `ouverte` → `cloturee` (Clôturer)
- **Envoi** : `POST campagnes/{id}/ouvrir`
- **Le serveur** :
  - à l'ouverture, la campagne apparaît dans `GET contexte` : avances, visites et pesées deviennent possibles ;
  - à la clôture, plus aucune saisie datée de cette campagne n'est acceptée ; tout reste lisible.
- **Refus** :
  - `PRIX_ABSENT` — Pas de prix d'achat ni de règles en vigueur pour le produit : ouverture refusée.
  - `OPERATIONS_EN_COURS` — Clôture refusée tant qu'il reste des pesées à valider ou à payer, des lots non vendus ou des avances non soldées ; `details` les compte.
- **Ensuite** : recharger `GET contexte` : le sélecteur de la barre supérieure change pour tout le monde.
- **Aussi** :
  - Clôturer : `POST campagnes/{id}/cloturer` — confirmation qui nomme la campagne ; irréversible depuis l'écran

### 12.5 Zones — `/administration/zones`

**Lecture** · `administration.zone.voir` · `GET zones` · filtres : `niveau`, `parent_id`

L'arbre complet tient en une requête (150 à 300 lignes) : `shared/services/references/` le garde en mémoire et `shared/metier/zone-arbre/` l'affiche. Niveaux, de haut en bas : `pays`, `region`, `prefecture`, `zone`, `district`, `village`.

#### AD-09 · Créer ou modifier une zone

- **Permission** : `administration.zone.saisir`
- **Où** : bouton « Ajouter sous… » sur un nœud de l'arbre · formulaire en dialogue
- **Envoi** : `POST zones`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Rattachée à | `parent_id` | sélecteur → `zones` | — | préremplie par le nœud choisi ; vide pour le pays |
| Niveau | `niveau` | liste : `pays` · `region` · `prefecture` · `zone` · `district` · `village` | oui | proposé : le niveau qui suit celui du parent |
| Code | `code` | texte (20) | oui | court et unique : `KOL`, `KOL-DAB` |
| Nom | `nom` | texte (100) | oui | — |
| Latitude | `latitude` | coordonnée GPS | — | facultative ; centre de la zone sur la carte |
| Longitude | `longitude` | coordonnée GPS | — | — |

**Rempli par le serveur** : `chemin`.

```json
{
  "parent_id": 17, "niveau": "village", "code": "KOL-DAB", "nom": "Dabiss", "latitude": null,
  "longitude": null
}
```

- **Le serveur** : calcule `zones.chemin` (« /1/4/17/ ») : c'est lui qui additionne la collecte d'une zone et de tout ce qu'elle contient.
- **Refus** :
  - `CODE_DEJA_UTILISE` — Une autre zone porte ce code.
  - `NIVEAU_INCOHERENT` — Le niveau doit être plus bas que celui du parent.
- **Aussi** :
  - Modifier : `PUT zones/{id}` — nom, code, coordonnées ; déplacer une zone (`parent_id`) est refusé dès qu'elle porte des producteurs
  - Désactiver : `POST zones/{id}/desactiver` — refusé si la zone contient des producteurs ou des champs actifs

### 12.6 Dépôts — `/administration/depots`

**Lecture** · `administration.depot.voir` · `GET depots`

**Colonnes de la liste** : `code`, `nom`, `zone_id`, `capacite_kg`, `responsable_id`, `est_actif`

#### AD-10 · Créer ou modifier un dépôt

- **Permission** : `administration.depot.saisir`
- **Où** : formulaire en dialogue
- **Avant la saisie** : `GET utilisateurs?role_id=…` — responsables possibles (rôle `TRAITEMENT`)
- **Envoi** : `POST depots`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Code | `code` | texte (20) | oui | `DEP-KOL` |
| Nom | `nom` | texte (100) | oui | — |
| Zone | `zone_id` | sélecteur → `zones` | oui | — |
| Latitude | `latitude` | coordonnée GPS | — | — |
| Longitude | `longitude` | coordonnée GPS | — | — |
| Capacité | `capacite_kg` | poids en kg | — | — |
| Responsable | `responsable_id` | sélecteur → `utilisateurs` | — | utilisateur du rôle `TRAITEMENT` |
| Actif | `est_actif` | case à cocher | — | — |

```json
{
  "code": "DEP-KOL", "nom": "Dépôt de Kolaboui", "zone_id": 17, "latitude": null, "longitude": null,
  "capacite_kg": "200000.000", "responsable_id": 4, "est_actif": true
}
```

- **Refus** :
  - `CODE_DEJA_UTILISE` — Un autre dépôt porte ce code.
- **Aussi** :
  - Modifier : `PUT depots/{id}`
  - Désactiver : `POST depots/{id}/desactiver` — refusé s'il reste du stock dans le dépôt

> La capacité de l'exemple est une valeur d'illustration.

### 12.7 Paramètres et seuils — `/administration/parametres`

**Lecture** · `administration.parametre.voir` · `GET parametres`

Chaque ligne renvoie le paramètre, sa valeur en vigueur et son historique (`parametre_valeurs`). Paramètres livrés : `AVANCE_PLAFOND_PCT`, `RETENUE_PCT`, `ALERTE_SANS_LIVRAISON_JOURS`, `ECART_POIDS_SEUIL_PCT`, `ALERTE_FIN_CONTRAT_JOURS`. La liste ne se saisit pas : un paramètre n'a de sens que si le code le lit.

#### AD-11 · Ouvrir une nouvelle valeur à partir d'une date

- **Permission** : `administration.parametre.saisir`
- **Où** : bouton « Nouvelle valeur à partir du… » de la ligne · formulaire en dialogue
- **Envoi** : `POST parametres/{id}/valeurs`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Valeur | `valeur` | texte (100) | oui | le champ suit `parametres.type_valeur` : entier, décimal, texte ou oui/non ; l'unité (`parametres.unite`) s'affiche à droite |
| À partir du | `date_debut` | date | oui | aujourd'hui ou plus tard |

**Rempli par le serveur** : `parametre_id`.

```json
{
  "valeur": "40", "date_debut": "2026-01-01"
}
```

- **Le serveur** : ferme la valeur précédente (`date_fin`) et insère la nouvelle ; les opérations déjà enregistrées gardent le taux copié ce jour-là.
- **Refus** :
  - `DATE_DEJA_UTILISEE` — Une valeur commence déjà à cette date.
  - `DATE_DANS_LE_PASSE` — Une valeur datée ne s'ouvre pas avant aujourd'hui.
  - `VALEUR_INVALIDE` (422) — La valeur ne correspond pas au type du paramètre.

### 12.8 Devises et taux de change — `/administration/devises`

**Lecture** · `administration.devise.voir` · `GET devises` · `GET taux-change` · filtres : `devise_id`, `du`, `au`

Deux blocs : les devises (GNF, USD, EUR) et, pour chaque devise étrangère, le taux du jour et son historique.

#### AD-12 · Saisir le taux du jour

- **Permission** : `administration.devise.saisir`
- **Où** : bouton « Taux du jour » d'une devise · formulaire en dialogue
- **Envoi** : `POST taux-change`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Devise | `devise_id` | sélecteur → `devises` | oui | préremplie ; jamais la monnaie de tenue |
| Date | `date_taux` | date | oui | aujourd'hui ; un seul taux par devise et par jour |
| Taux | `taux` | taux de change | oui | nombre de GNF pour 1 unité de la devise ; supérieur à 0 |
| Source | `source` | texte (100) | — | banque ou site d'où vient le taux |

```json
{
  "devise_id": 2, "date_taux": "2026-06-20", "taux": "8700.000000", "source": "Banque"
}
```

- **Le serveur** : une vente, une dépense ou un encaissement en devise **copie** le taux de sa date : corriger le taux après coup ne change aucune opération.
- **Refus** :
  - `TAUX_DEJA_SAISI` — Un taux existe pour cette devise à cette date : le corriger par `PUT taux-change/{id}`, possible tant qu'aucune opération ne l'a copié.
- **Aussi** :
  - Ajouter ou modifier une devise : `POST devises` — champs `code` (3 lettres), `libelle`, `symbole`, `nombre_decimales` ; `est_devise_tenue` ne se modifie pas depuis l'écran

### 12.9 Société — `/administration/societe`

**Lecture** · `administration.societe.voir` · `GET societe`

Une seule ligne dans `societes` : pas de liste, un formulaire en page. Son contenu sert d'en-tête à tous les documents imprimés.

#### AD-13 · Modifier l'identité de la société

- **Permission** : `administration.societe.saisir`
- **Où** : formulaire en page
- **Envoi** : `PUT societe`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Raison sociale | `raison_sociale` | texte (150) | oui | — |
| Sigle | `sigle` | texte (30) | — | — |
| Forme juridique | `forme_juridique` | texte (30) | — | SARL, SA… |
| RCCM | `rccm` | texte (50) | — | — |
| NIF | `nif` | texte (30) | — | — |
| Adresse | `adresse` | texte (255) | oui | — |
| Téléphone | `telephone` | téléphone (20) | oui | — |
| Courriel | `email` | courriel (150) | — | — |
| Monnaie de tenue | `devise_id` | sélecteur → `devises` | oui | en lecture seule dès la première écriture |
| Système comptable | `systeme_comptable` | liste : `normal` · `smt` | — | à fixer avec le comptable ; en lecture seule dès la première écriture |
| Premier mois de l'exercice | `mois_debut_exercice` | entier | — | 1 à 12 |

- **Ensuite** : les prochains PDF portent le nouvel en-tête ; les documents déjà émis ne changent pas.
- **Aussi** :
  - Changer le logo : `POST societe/logo` — `multipart/form-data`, clé `fichier` ; le serveur renseigne `societes.logo_chemin`

### 12.10 Numérotation — `/administration/numerotation`

**Lecture** · `administration.compteur.voir` · `GET compteurs`

**Colonnes de la liste** : `type_document`, `exercice`, `prefixe`, `dernier_numero`, `longueur`

Une ligne par type de document et par exercice. `dernier_numero` est en lecture seule : le serveur l'incrémente dans la transaction qui crée le document.

#### AD-14 · Régler le préfixe ou la longueur d'un numéro

- **Permission** : `administration.compteur.saisir`
- **Où** : formulaire en dialogue
- **Envoi** : `PUT compteurs/{id}`

| Champ à l'écran | Clé envoyée | Saisie | Oblig. | Règle, valeur par défaut |
|---|---|---|---|---|
| Préfixe | `prefixe` | texte (10) | oui | `AV`, `PE`, `FAC`… |
| Nombre de chiffres | `longueur` | entier | — | 6 donne `PE-2026-001234` |

```json
{
  "prefixe": "PE", "longueur": 6
}
```

- **Refus** :
  - `COMPTEUR_ENTAME` — Le préfixe ne change plus dès qu'un numéro a été attribué dans l'exercice.
- **Ensuite** : aperçu du prochain numéro sous le formulaire, calculé par le serveur.

### 12.11 Journal d'audit — `/administration/audit`

**Lecture** · `administration.audit.voir` · `GET journal-activites` · filtres : `utilisateur_id`, `action`, `table_cible`, `du`, `au`

**Colonnes de la liste** : `date_action`, `utilisateur_id`, `action`, `table_cible`, `ligne_id`

Lecture seule pour tout le monde, gérant compris. Une ligne ouvre un panneau avec `valeurs_avant` et `valeurs_apres` côte à côte, et un lien vers l'écran d'origine (`core/navigation/origines.ts`).

### 12.12 Connexions — `/administration/connexions`

**Lecture** · `administration.connexion.voir` · `GET connexions` · filtres : `utilisateur_id`, `est_reussie`, `du`, `au`

**Colonnes de la liste** : `date_connexion`, `utilisateur_id`, `telephone_saisi`, `ip`, `appareil`, `est_reussie`

Lecture seule. Les tentatives ratées s'affichent avec la pastille rouge.

### 12.13 Documents émis — `/administration/documents`

**Lecture** · `administration.document.voir` · `GET documents` · filtres : `type_document`, `recherche`, `du`, `au`

**Colonnes de la liste** : `date_emission`, `type_document`, `numero`, `emis_par`, `nombre_impressions`, `code_verification`

Lecture seule. Le champ « Vérifier un papier » appelle SE-09 avec le code imprimé sous le QR.

---

## 13. Mon espace

`mon-espace/` · préfixe `me` · espace : Producteur · 5 pages, 0 actions · application à ouvrir (`status: 'soon'`)

L'espace du producteur : **cinq écrans de lecture, aucun formulaire**. Pensé pour le téléphone, avec la barre du bas.

Aucune de ces requêtes ne porte d'identifiant de producteur : le serveur lit `producteur_id` dans la session et ne renvoie que ses lignes. Une seule permission, `mon-espace.compte.voir`.

### 13.1 Mon compte — `/mon-espace/compte`

**Lecture** · `mon-espace.compte.voir` · `GET mon-espace/compte`

`v_compte_producteur` pour la campagne choisie : kilos livrés, montant total, retenues, payé, reste à recevoir ; et le reste dû de son avance.

### 13.2 Mes livraisons — `/mon-espace/livraisons`

**Lecture** · `mon-espace.compte.voir` · `GET mon-espace/livraisons`

Ses pesées `validee` et `payee` : date, poids net, humidité, prix, montant, retenue, net. Les pesées `saisie`, `remplacee` et `annulee` ne lui sont pas montrées.

### 13.3 Mes paiements — `/mon-espace/paiements`

**Lecture** · `mon-espace.compte.voir` · `GET mon-espace/paiements`

Ses lignes de `paiements_producteurs` non annulées : date, montant, mode, référence, et le reçu en PDF (SE-09).

### 13.4 Mes avances — `/mon-espace/avances`

**Lecture** · `mon-espace.compte.voir` · `GET mon-espace/avances`

Ses avances `versee`, `soldee` et `en_retard` : montant versé, remboursé, reste dû, et le détail des retenues (`avance_remboursements`).

### 13.5 Mes champs — `/mon-espace/champs`

**Lecture** · `mon-espace.compte.voir` · `GET mon-espace/champs`

Ses champs, leur surface, la date et l'estimation de la dernière visite.

---

## 14. États et pastilles

Pour chaque table qui porte un état : ses valeurs, la pastille à afficher (`shared/models/statuts.ts`), et **par quelle action on y arrive**. Un bouton n'apparaît que si la ligne est dans l'état de départ de son action.

**`campagnes.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `preparation` | En préparation | neutre | AD-07 |
| `ouverte` | Ouverte | ok | AD-08, depuis `preparation` |
| `cloturee` | Clôturée | eteint | AD-08, depuis `ouverte` |

**`producteurs.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `incomplet` | Dossier incomplet | attente | TE-01 |
| `actif` | Actif | ok | depuis `incomplet` : le serveur, dès que le dossier est complet (pièce d'identité et au moins un champ)<br>TE-02, depuis `suspendu` |
| `suspendu` | Suspendu | danger | TE-02, depuis `actif` |

**`avances.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `proposee` | À valider | attente | CO-01 |
| `validee` | À verser | attente | CO-02, depuis `proposee`<br>depuis `versee` : « Annuler un versement », variante de CO-03 |
| `refusee` | Refusée | danger | CO-02, depuis `proposee` |
| `versee` | Versée | info | CO-03, depuis `validee` |
| `soldee` | Soldée | ok | depuis `versee` ou `en_retard` : le serveur, quand `montant_rembourse` atteint `montant_verse` : retenues des pesées (TE-06), remboursement ou abandon |
| `en_retard` | En retard | danger | depuis `versee` : le serveur, chaque nuit : `date_limite_livraison` dépassée sans aucune pesée ; une alerte `avance_sans_livraison` est levée |
| `annulee` | Annulée | eteint | depuis `proposee` : « Annuler une demande », variante de CO-01 |

**`pesees.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `saisie` | Saisie | neutre | TE-05 |
| `validee` | À payer | attente | TE-06, depuis `saisie`<br>TE-07<br>depuis `payee` : « Annuler un paiement », variante de CO-08 |
| `payee` | Payée | ok | CO-08, depuis `validee` |
| `remplacee` | Remplacée | eteint | TE-07, depuis `validee` |
| `annulee` | Annulée | eteint | depuis `saisie` ou `validee` : « Annuler une pesée », variante de TE-05 et de TE-07 |

**`bordereaux.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `prepare` | Préparé | neutre | TE-08 |
| `envoye` | Envoyé | info | TE-09, depuis `prepare` |
| `recu` | Reçu | ok | depuis `envoye` : la réception au dépôt (DE-01), sans écart hors seuil |
| `recu_avec_ecart` | Reçu avec écart | danger | depuis `envoye` : la réception au dépôt (DE-01), quand l'écart dépasse le seuil |

**`entrees_depot.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `recue` | À valider | attente | DE-01 |
| `contestee` | Contestée | danger | depuis `recue` : « Contester l'entrée », variante de DE-02 |
| `validee` | Validée | ok | DE-02, depuis `recue` ou `contestee` |

**`lots.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `en_traitement` | En traitement | info | DE-02 |
| `pret_a_vendre` | Prêt à vendre | ok | depuis `en_traitement` : le serveur, à la fin de la dernière étape obligatoire, si la perte reste sous le seuil<br>depuis `bloque` : la décision du gérant sur la demande de déblocage (PI-03) ; `debloque_par` est renseigné |
| `bloque` | Bloqué | danger | depuis `en_traitement` : le serveur, à la fin d'une étape (DE-05), quand la perte dépasse `perte_seuil_blocage` |
| `vendu` | Vendu | neutre | DE-07, depuis `pret_a_vendre` |

**`traitements.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `en_cours` | En cours | info | DE-04 |
| `termine` | Terminé | ok | DE-05, depuis `en_cours` |

**`inventaires.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `en_cours` | En cours | attente | DE-08 |
| `valide` | Validé | ok | DE-10, depuis `en_cours` |

**`clients.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `actif` | Actif | ok | VE-01 |
| `suspendu` | Suspendu | danger | depuis `actif` : « Suspendre », variante de VE-01 |

**`lots_vente.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `en_composition` | En composition | neutre | VE-02 |
| `pret` | Prêt | info | VE-03, depuis `en_composition` |
| `vendu` | Vendu | info | depuis `pret` : la confirmation du contrat (VE-05) |
| `expedie` | Expédié | info | depuis `vendu` : l'embarquement du dossier d'export (VE-13) |
| `livre` | Livré, à encaisser | attente | depuis `vendu` ou `expedie` : la livraison : dossier d'export `livre`, ou vente locale marquée livrée |
| `encaisse` | Encaissé | ok | depuis `vendu` ou `expedie` ou `livre` : le dernier encaissement de la facture (CO-09) |

**`ventes.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `brouillon` | Brouillon | neutre | VE-04 |
| `confirmee` | Confirmée | info | VE-05, depuis `brouillon` |
| `livree` | Livrée, à payer | attente | depuis `confirmee` : « Marquer une vente locale livrée », variante de VE-05 ; ou la livraison du dossier d'export (VE-13) |
| `payee_partiel` | Payée en partie | attente | depuis `confirmee` ou `livree` : un encaissement partiel de la facture (CO-09) |
| `payee` | Payée | ok | depuis `confirmee` ou `livree` ou `payee_partiel` : le dernier encaissement de la facture (CO-09) |
| `annulee` | Annulée | eteint | depuis `brouillon` ou `confirmee` : « Annuler un contrat », variante de VE-05 |

**`factures.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `brouillon` | Brouillon | neutre | VE-06 |
| `emise` | À encaisser | attente | VE-07, depuis `brouillon` |
| `payee_partiel` | Payée en partie | attente | depuis `emise` : un encaissement partiel (CO-09) |
| `payee` | Payée | ok | depuis `emise` ou `payee_partiel` : le dernier encaissement (CO-09)<br>CO-09, depuis `emise` ou `payee_partiel` |
| `annulee` | Annulée | eteint | VE-08, depuis `emise` |

**`dossiers_export.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `en_preparation` | En préparation | attente | VE-09 |
| `embarque` | Embarqué | info | VE-13, depuis `en_preparation` |
| `arrive` | Arrivé | info | VE-13, depuis `embarque` |
| `livre` | Livré | ok | VE-13, depuis `arrive` |
| `annule` | Annulé | eteint | depuis `en_preparation` : « Annuler un dossier », variante de VE-09 |

**`dossiers_import.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `commande` | Commandé | neutre | VE-14 |
| `en_transit` | En transit | info | VE-15, depuis `commande` |
| `dedouane` | Dédouané | info | VE-15, depuis `en_transit` |
| `recu` | Reçu | ok | VE-15, depuis `dedouane` |
| `cloture` | Clôturé | eteint | VE-15, depuis `recu` |

**`dossier_documents.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `attendu` | Attendu | attente | le serveur à l'ouverture du dossier, ou « Ajouter une pièce non exigée » |
| `recu` | Reçu, à valider | attente | VE-10, depuis `attendu` ou `rejete` |
| `valide` | Validé | ok | VE-11, depuis `recu` |
| `rejete` | Rejeté | danger | VE-11, depuis `recu` |

**`transferts_fonds.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `demande` | À valider | attente | CO-10 |
| `valide` | En route, à recevoir | attente | CO-11, depuis `demande` |
| `recu` | Reçu | ok | CO-12, depuis `valide` |
| `annule` | Annulé | eteint | depuis `demande` : « Annuler une demande », variante de CO-10 |

**`rapprochements_bancaires.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `en_cours` | En cours | attente | CO-15 |
| `valide` | Validé | ok | CO-16, depuis `en_cours` |

**`fournisseurs.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `actif` | Actif | ok | CO-20 |
| `suspendu` | Suspendu | danger | depuis `actif` : « Suspendre », variante de CO-20 |

**`depenses.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `saisie` | À valider | attente | CO-17 |
| `validee` | À régler | attente | CO-18, depuis `saisie` |
| `payee_partiel` | Réglée en partie | attente | depuis `validee` : un règlement partiel (CO-19) |
| `payee` | Réglée | ok | CO-19, depuis `validee` ou `payee_partiel` |
| `annulee` | Annulée | eteint | depuis `saisie` ou `validee` : « Annuler une dépense », variante de CO-17 et de CO-18 |

**`exercices.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `ouvert` | Ouvert | ok | CO-27 |
| `cloture` | Clôturé | eteint | CO-27, depuis `ouvert` |

**`periodes.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `ouverte` | Ouverte | ok | CO-27, depuis `cloturee` |
| `cloturee` | Clôturée | eteint | CO-27, depuis `ouverte` |

**`ecritures.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `brouillard` | Brouillard | attente | CO-23 |
| `validee` | Validée | ok | CO-24, depuis `brouillard` |

**`immobilisations.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `en_service` | En service | ok | CO-28 |
| `cedee` | Cédée | eteint | CO-28, depuis `en_service` |
| `rebut` | Mise au rebut | eteint | CO-28, depuis `en_service` |

**`employes.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `actif` | Actif | ok | RH-01<br>RH-01, depuis `suspendu` |
| `suspendu` | Suspendu | danger | RH-01, depuis `actif` |
| `sorti` | Sorti | eteint | RH-01, depuis `actif` ou `suspendu` |

**`contrats_travail.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `actif` | En cours | ok | RH-02 |
| `termine` | Terminé | eteint | RH-02, depuis `actif` |
| `rompu` | Rompu | danger | RH-02, depuis `actif` |

**`conges.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `demande` | À décider | attente | RH-05 |
| `approuve` | Approuvé | ok | RH-06, depuis `demande` |
| `refuse` | Refusé | danger | RH-06, depuis `demande` |
| `annule` | Annulé | eteint | RH-05, depuis `demande` |

**`missions.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `planifiee` | Planifiée | neutre | RH-07 |
| `en_cours` | En cours | info | RH-07, depuis `planifiee` |
| `terminee` | Terminée | ok | RH-07, depuis `en_cours` |
| `annulee` | Annulée | eteint | RH-07, depuis `planifiee` ou `en_cours` |

**`periodes_paie.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `ouverte` | Ouverte | neutre | RH-08 |
| `calculee` | Calculée, à valider | attente | RH-08, depuis `ouverte` ou `calculee` |
| `validee` | Validée, à payer | attente | RH-09, depuis `calculee` |
| `payee` | Payée | ok | depuis `validee` : le serveur, quand le dernier bulletin du mois est payé |
| `cloturee` | Clôturée | eteint | RH-09, depuis `payee` |

**`bulletins.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `calcule` | Calculé | neutre | RH-08 |
| `valide` | À payer | attente | RH-09, depuis `calcule` |
| `paye` | Payé | ok | RH-12, depuis `valide` |
| `annule` | Annulé | eteint | depuis `calcule` ou `valide` : le serveur, quand un bulletin est remplacé par un nouveau calcul ou annulé avec sa paie |

**`avances_salaire.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `demandee` | À décider | attente | RH-10 |
| `approuvee` | À verser | attente | RH-11, depuis `demandee` |
| `versee` | Versée | info | RH-12, depuis `approuvee` |
| `soldee` | Soldée | ok | depuis `versee` : le serveur, quand les retenues sur bulletins ont tout remboursé |
| `refusee` | Refusée | danger | RH-11, depuis `demandee` |

**`alertes.statut`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `ouverte` | Ouverte | danger | le serveur, quand un seuil est dépassé ou un délai échu |
| `en_cours` | En cours | info | PI-02, depuis `ouverte` |
| `traitee` | Traitée | ok | PI-02, depuis `ouverte` ou `en_cours` |
| `ignoree` | Ignorée | eteint | PI-02, depuis `ouverte` ou `en_cours` |

**`approbations.decision`**

| Valeur | Pastille | Ton | On y arrive par |
|---|---|---|---|
| `en_attente` | En attente | attente | les actions qui demandent une décision : CO-01, DE-03, CO-10, RH-08 |
| `approuvee` | Approuvée | ok | PI-03, depuis `en_attente` |
| `reduite` | Approuvée, montant réduit | ok | PI-03, depuis `en_attente` |
| `refusee` | Refusée | danger | PI-03, depuis `en_attente` |

`presences.statut` n'est pas un cycle : c'est la situation d'une journée, saisie par RH-04. Valeurs et pastilles sont dans `statuts.ts`.

Le fichier complet, généré depuis la base :

```ts
// shared/models/statuts.ts (début)
/** Ton d'une pastille : il répond à une seule question, « quelqu'un doit-il agir ? ». */
export type Ton = 'neutre' | 'info' | 'attente' | 'ok' | 'danger' | 'eteint';

export interface StatutDef { label: string; ton: Ton; }

/** Clé = nom de la table, puis valeur de sa colonne d'état (`statut` ; `decision` pour approbations). Valeurs du script SQL. */
export const STATUTS = {
  campagnes: {
    preparation: { label: 'En préparation', ton: 'neutre' },
    ouverte:     { label: 'Ouverte', ton: 'ok' },
    cloturee:    { label: 'Clôturée', ton: 'eteint' },
  },
  producteurs: {
    incomplet: { label: 'Dossier incomplet', ton: 'attente' },
    actif:     { label: 'Actif', ton: 'ok' },
    suspendu:  { label: 'Suspendu', ton: 'danger' },
  },
  avances: {
    proposee:  { label: 'À valider', ton: 'attente' },
    validee:   { label: 'À verser', ton: 'attente' },
    refusee:   { label: 'Refusée', ton: 'danger' },
    versee:    { label: 'Versée', ton: 'info' },
  // … les 34 tables sont dans l'archive
```

---

## 15. Listes de valeurs

Toutes les colonnes `ENUM` qui ne sont pas un état, avec le libellé à afficher. La valeur de gauche part telle quelle dans la requête.

| Colonne | Valeurs et libellés |
|---|---|
| `journal_activites.action` | `creation` Création · `modification` Modification · `validation` Validation · `paiement` Paiement · `annulation` Annulation · `suppression` Suppression · `export` Export · `connexion` Connexion |
| `pieces_jointes.categorie` | `photo` Photo · `recu_signe` Reçu signé · `justificatif` Justificatif · `piece_identite` Pièce d'identité · `document_dossier` Document de dossier · `contrat` Contrat · `autre` Autre |
| `documents_emis.type_document` | `recu_avance` Reçu d'avance · `recu_pesee` Reçu de pesée · `bordereau` Bordereau d'envoi · `facture` Facture · `bulletin_paie` Bulletin de paie · `recu_paiement` Reçu de paiement · `autre` Autre |
| `societes.systeme_comptable` | `normal` Système normal · `smt` Système minimal de trésorerie |
| `zones.niveau` | `pays` Pays · `region` Région · `prefecture` Préfecture · `zone` Zone · `district` District · `village` Village |
| `parametres.type_valeur` | `entier` Nombre entier · `decimal` Nombre décimal · `texte` Texte · `booleen` Oui ou non |
| `producteurs.sexe` | `M` Homme · `F` Femme |
| `producteurs.type_piece` | `cni` Carte nationale d'identité · `passeport` Passeport · `carte_electeur` Carte d'électeur · `autre` Autre |
| `visites.etat_champ` | `bon` Bon · `moyen` Moyen · `mauvais` Mauvais |
| `visites.stade` | `repos` Repos · `floraison` Floraison · `fructification` Fructification · `recolte` Récolte |
| `avance_versements.mode_paiement` | `especes` Espèces · `orange_money` Orange Money · `virement` Virement |
| `avance_remboursements.origine` | `retenue_pesee` Retenue sur une pesée · `especes` Remboursement en espèces · `abandon` Abandon |
| `paiements_producteurs.mode_paiement` | `especes` Espèces · `orange_money` Orange Money · `virement` Virement |
| `mouvements_stock.type_mouvement` | `entree_collecte` Entrée de collecte · `perte_traitement` Perte au traitement · `ajustement_inventaire` Ajustement d'inventaire · `sortie_vente` Sortie pour vente |
| `mouvements_stock.sens` | `entree` Entrée · `sortie` Sortie |
| `ventes.unite_prix` | `kg` Au kilo · `tonne` À la tonne |
| `encaissements.mode_paiement` | `virement` Virement · `especes` Espèces · `cheque` Chèque · `orange_money` Orange Money |
| `lot_couts.nature` | `achat` Achat aux producteurs · `transport` Transport · `traitement` Traitement · `main_oeuvre` Main-d'œuvre · `emballage` Emballage · `frais_export` Frais d'export · `autre` Autre |
| `types_documents.sens` | `export` Export · `import` Import |
| `dossiers_import.nature` | `sacs` Sacs · `intrants` Intrants · `equipement` Équipement · `autre` Autre |
| `comptes_tresorerie.type` | `caisse` Caisse · `banque` Banque · `mobile_money` Orange Money |
| `mouvements_tresorerie.sens` | `entree` Entrée · `sortie` Sortie |
| `mouvements_tresorerie.nature` | `avance_producteur` Avance à un producteur · `remboursement_avance` Remboursement d'avance · `paiement_pesee` Paiement d'une pesée · `depense` Dépense · `salaire` Salaire · `avance_salaire` Avance sur salaire · `encaissement_client` Encaissement d'un client · `transfert` Transfert de fonds · `ajustement` Ajustement |
| `fournisseurs.type` | `transporteur` Transporteur · `transitaire` Transitaire · `intrants` Vendeur d'intrants · `prestataire` Prestataire · `administration` Administration · `autre` Autre |
| `natures_depense.nature_cout` | `transport` Transport · `traitement` Traitement · `main_oeuvre` Main-d'œuvre · `emballage` Emballage · `frais_export` Frais d'export · `autre` Autre |
| `paiements_depenses.mode_paiement` | `especes` Espèces · `orange_money` Orange Money · `virement` Virement · `cheque` Chèque |
| `comptes.sens_normal` | `debit` Débit · `credit` Crédit |
| `journaux.type` | `achats` Achats · `ventes` Ventes · `tresorerie` Trésorerie · `paie` Paie · `operations_diverses` Opérations diverses · `a_nouveaux` À-nouveaux |
| `tiers.type` | `producteur` Producteur · `client` Client · `fournisseur` Fournisseur · `employe` Employé · `etat` État · `organisme_social` Organisme social · `autre` Autre |
| `schema_comptable_lignes.sens` | `debit` Débit · `credit` Crédit |
| `schema_comptable_lignes.source_compte` | `fixe` Compte fixe · `tresorerie` Compte de la caisse ou de la banque utilisée · `produit_achat` Compte d'achat du produit · `produit_vente` Compte de vente du produit · `produit_stock` Compte de stock du produit · `produit_variation` Compte de variation de stock · `nature_depense` Compte de la nature de dépense · `rubrique_debit` Compte de débit de la rubrique · `rubrique_credit` Compte de crédit de la rubrique · `taxe_collectee` Compte de taxe facturée · `taxe_deductible` Compte de taxe récupérable · `immo_dotation` Compte de dotation du bien · `immo_amortissement` Compte d'amortissement du bien |
| `immobilisations.mode` | `lineaire` Linéaire · `degressif` Dégressif |
| `etats_financiers.systeme` | `normal` Système normal · `smt` Système minimal de trésorerie |
| `etat_postes.type` | `detail` Poste de détail · `total` Total |
| `etat_poste_comptes.mode_solde` | `solde` Solde · `solde_debiteur` Solde débiteur · `solde_crediteur` Solde créditeur · `mouvement_debit` Mouvements au débit · `mouvement_credit` Mouvements au crédit |
| `etat_poste_comptes.signe` | `plus` Ajouter · `moins` Retrancher |
| `etat_poste_comptes.colonne` | `brut` Brut · `amortissement` Amortissements et dépréciations |
| `employes.sexe` | `M` Homme · `F` Femme |
| `employes.type_piece` | `cni` Carte nationale d'identité · `passeport` Passeport · `autre` Autre |
| `employes.mode_paiement` | `virement` Virement · `especes` Espèces · `orange_money` Orange Money |
| `contrats_travail.type` | `cdi` CDI · `cdd` CDD · `stage` Stage · `saisonnier` Saisonnier · `journalier` Journalier |
| `contrats_travail.periodicite` | `mensuel` Au mois · `journalier` À la journée |
| `presences.source` | `saisie` Saisie · `visite` Déduit d'une visite · `pesee` Déduit d'une pesée |
| `rubriques_paie.type` | `gain` Gain · `retenue` Retenue · `cotisation_salariale` Cotisation salariale · `cotisation_patronale` Cotisation patronale |
| `rubriques_paie.mode_calcul` | `fixe` Montant fixe · `pourcentage` Pourcentage · `bareme` Barème · `saisie` Saisi chaque mois |
| `rubriques_paie.base_calcul` | `salaire_base` Salaire de base · `brut` Salaire brut · `brut_imposable` Brut imposable |
| `bulletin_lignes.type` | `gain` Gain · `retenue` Retenue · `cotisation_salariale` Cotisation salariale · `cotisation_patronale` Cotisation patronale |
| `avances_salaire.mode_paiement` | `especes` Espèces · `orange_money` Orange Money · `virement` Virement |
| `paiements_salaires.mode_paiement` | `virement` Virement · `especes` Espèces · `orange_money` Orange Money |
| `alertes.type` | `avance_sans_livraison` Avance sans livraison · `perte_anormale` Perte anormale · `ecart_poids` Écart de poids · `humidite` Humidité · `paiement_client_retard` Client en retard de paiement · `fin_contrat` Fin de contrat · `dossier_incomplet` Dossier incomplet · `ecart_caisse` Écart de caisse |
| `alertes.niveau` | `information` Information · `attention` Attention · `critique` Critique |
| `approbations.type` | `avance` Avance · `derogation_plafond` Dérogation au plafond · `deblocage_lot` Déblocage d'un lot · `paie` Paie · `transfert_fonds` Transfert de fonds · `autre` Autre |

```ts
// shared/models/listes.ts (extrait)
export interface Option { valeur: string; libelle: string; }
export const LISTES = {
  'visites.etat_champ': [{ valeur: 'bon', libelle: 'Bon' }, { valeur: 'moyen', libelle: 'Moyen' }, { valeur: 'mauvais', libelle: 'Mauvais' }],
  'avance_versements.mode_paiement': [{ valeur: 'especes', libelle: 'Espèces' }, { valeur: 'orange_money', libelle: 'Orange Money' }, { valeur: 'virement', libelle: 'Virement' }],
  'ventes.unite_prix': [{ valeur: 'kg', libelle: 'Au kilo' }, { valeur: 'tonne', libelle: 'À la tonne' }],
  // …
} as const satisfies Record<string, readonly Option[]>;
export function libelleDe(liste: NomDeListe, valeur: string | null | undefined): string {
```

Dans un formulaire : `@for (o of LISTES['visites.etat_champ']; track o.valeur) { … }`. Dans une liste : `libelleDe('mouvements_tresorerie.nature', ligne.nature)`.

---

## 16. Motifs de refus

Les `code` que l'API peut renvoyer, avec les actions concernées. Le message affiché est toujours celui de la réponse ; ce tableau sert à **prévoir** l'écran : où placer le bandeau, quel lien proposer, quel bouton désactiver d'avance.

### 16.1 Communs à toutes les actions

| Code | HTTP | Sens |
|------|------|------|
| `VALIDATION` | 422 | saisie incorrecte ; `erreurs` nomme les champs |
| `ETAT_INCOMPATIBLE` | 409 | la ligne n'est plus dans l'état attendu : recharger la fiche |
| `PERMISSION_MANQUANTE` | 403 | l'utilisateur n'a pas la permission de l'action |
| `HORS_PERIMETRE` | 403 | la ligne n'est pas dans sa zone ou son dépôt |
| `SESSION_EXPIREE` | 401 | jeton absent, expiré ou révoqué |
| `INTROUVABLE` | 404 | ligne inconnue, ou cachée par le périmètre |

### 16.2 Propres à une action

| Code | HTTP | Sens | Actions |
|---|---|---|---|
| `ANNULATION_PAR_L_OPERATION` | 409 | Versement d'avance ou paiement de pesée : s'annule depuis l'opération (« Annuler un versement », « Annuler un paiement »), pas ici. | CO-07 |
| `AVANCE_DEJA_EN_COURS` | 409 | Une demande `proposee` ou `validee` attend déjà pour ce producteur et cette campagne. | CO-01 |
| `BORDEREAU_DEJA_RECU` | 409 | Une entrée existe déjà pour ce bordereau. | DE-01 |
| `BORDEREAU_NON_ENVOYE` | 409 | Le bordereau est encore `prepare` : le terrain ne l'a pas envoyé. | DE-01 |
| `CAMPAGNE_FERMEE` | 409 | La date de l'opération tombe hors d'une campagne `ouverte`. | TE-05, CO-01 |
| `CHAMP_HORS_PRODUCTEUR` | 409 | Le champ n'appartient pas au producteur. | TE-05 |
| `CLIENT_SUSPENDU` | 409 | Le client est `suspendu`. | VE-04 |
| `CLOTURE_DEJA_FAITE` | 409 | Cette caisse est déjà clôturée à cette date. | CO-13 |
| `CODE_DEJA_UTILISE` | 409 | Une autre ligne de la même table porte déjà ce code. | VE-16, CO-06, CO-21, AD-02, AD-03, AD-07, AD-09, AD-10 |
| `COMPOSITION_VIDE` | 409 | Aucun lot du dépôt dans la composition. | VE-03 |
| `COMPTAGE_INCOMPLET` | 409 | Des lots n'ont pas de poids compté. | DE-10 |
| `COMPTES_IDENTIQUES` | 409 | Source et destination sont le même compte (contrainte de la base). | CO-10 |
| `COMPTEUR_ENTAME` | 409 | Le préfixe ne change plus dès qu'un numéro a été attribué dans l'exercice. | AD-14 |
| `COMPTE_DESACTIVE` | 403 | Le compte existe mais `utilisateurs.est_actif` vaut 0. | SE-01 |
| `CONTRAT_DEJA_ACTIF` | 409 | L'employé a déjà un contrat `actif` sur ces dates. | RH-02 |
| `DATE_DANS_LE_PASSE` | 409 | Une valeur datée ne s'ouvre pas avant aujourd'hui. | AD-04, AD-05, AD-11 |
| `DATE_DEJA_UTILISEE` | 409 | Une valeur datée commence déjà à cette date. | AD-04, AD-11 |
| `DEJA_DECIDEE` | 409 | La demande n'est plus `en_attente`. | PI-03 |
| `DEMANDEUR_EGAL_DECIDEUR` | 403 | La personne qui a demandé ne peut ni décider ni valider (contrainte de la base sur `avances` et `approbations`). | PI-03, CO-02, CO-11, RH-09 |
| `DEMANDE_DEJA_EN_ATTENTE` | 409 | Une demande de déblocage attend déjà la décision du gérant. | DE-03 |
| `DEPOT_HORS_PERIMETRE` | 403 | Le bordereau est destiné à un autre dépôt. | DE-01 |
| `DEVISES_DIFFERENTES` | 409 | Un transfert se fait entre deux comptes de la même devise. | CO-10 |
| `DEVISE_DU_COMPTE` | 409 | Le compte de trésorerie n'est pas dans la devise de la facture. | CO-09 |
| `DOSSIER_DEJA_OUVERT` | 409 | Un dossier non annulé existe déjà pour ce contrat. | VE-09 |
| `DOSSIER_INCOMPLET` | 409 | Des pièces obligatoires du dossier ne sont pas validées : `details.pieces_manquantes` les nomme. | VE-13, VE-15 |
| `ECART_NON_EXPLIQUE` | 409 | Le solde du relevé ne correspond pas au solde comptable corrigé des mouvements non pointés. | CO-16 |
| `ECRITURES_EN_BROUILLARD` | 409 | Il reste des écritures non validées dans la période. | CO-27 |
| `ECRITURE_AUTOMATIQUE` | 409 | Une écriture automatique s'annule depuis son opération d'origine. | CO-25 |
| `ECRITURE_DEJA_EXTOURNEE` | 409 | Cette écriture a déjà son inverse. | CO-25 |
| `ECRITURE_DESEQUILIBREE` | 422 | Total des débits différent du total des crédits : le bouton reste désactivé tant que l'écart affiché n'est pas nul. | CO-23 |
| `ESTIMATION_ABSENTE` | 409 | Aucune visite n'a donné d'estimation de récolte pour ce producteur : pas de plafond calculable. | CO-01 |
| `ETAPE_DEJA_FAITE` | 409 | Cette étape existe déjà pour ce lot. | DE-04 |
| `ETAPE_PRECEDENTE_NON_TERMINEE` | 409 | Les étapes se font dans l'ordre. | DE-04 |
| `ETAPE_UTILISEE` | 409 | Une étape déjà utilisée par un traitement ne se retire pas : on peut la renommer ou la rendre facultative. | AD-06 |
| `FACTURE_DEJA_EXISTANTE` | 409 | Une facture non annulée existe déjà pour ce contrat. | VE-06 |
| `FACTURE_ENCAISSEE` | 409 | Un encaissement existe : le contre-passer d'abord en Comptabilité (CO-07). | VE-08 |
| `FACTURE_SANS_LIGNE` | 409 | Aucune ligne, ou total à zéro. | VE-07 |
| `FICHIER_TROP_LOURD` | 413 | Taille au-dessus de la limite fixée par le serveur. | SE-07 |
| `FORMULE_INVALIDE` | 422 | La formule cite une référence de poste inconnue. | CO-29 |
| `FRAIS_NON_VALIDES` | 409 | Clôture refusée tant qu'un frais du dossier attend sa validation. | VE-15 |
| `IDENTIFIANTS_INCORRECTS` | 401 | Téléphone ou mot de passe incorrect : le message ne dit jamais lequel des deux. | SE-01 |
| `IMPUTATION_REQUISE` | 409 | La nature entre dans le coût de revient (`nature_cout`) mais aucun lot ni dossier n'est choisi. | CO-17 |
| `INVENTAIRE_DEJA_OUVERT` | 409 | Un inventaire `en_cours` existe déjà pour ce dépôt. | DE-08 |
| `INVENTAIRE_DE_CLOTURE_MANQUANT` | 409 | Pas d'inventaire de clôture validé pour l'exercice. | CO-27 |
| `JUSTIFICATIF_MANQUANT` | 409 | Aucune pièce jointe sur la dépense. | CO-18 |
| `JUSTIFICATION_REQUISE` | 409 | Un écart est déclaré sans justification. | DE-10, CO-13 |
| `LOT_BLOQUE` | 409 | Le lot est `bloque` : justification et décision du gérant d'abord. | DE-07 |
| `LOT_DEJA_COMPOSE` | 409 | Un lot figure déjà dans un autre lot de vente. | VE-02 |
| `LOT_HORS_COMPOSITION` | 409 | Ce lot ne fait pas partie du lot de vente. | DE-07 |
| `LOT_INCOMPATIBLE` | 409 | Le lot choisi est d'un autre produit, d'une autre campagne, d'un autre dépôt, ou n'est plus `en_traitement`. | DE-02 |
| `LOT_NON_EN_TRAITEMENT` | 409 | Le lot est `bloque`, `pret_a_vendre` ou `vendu`. | DE-04 |
| `LOT_NON_PRET` | 409 | Un lot n'est pas `pret_a_vendre` (en traitement ou bloqué). | VE-02 |
| `LOT_VENTE_DEJA_VENDU` | 409 | Un contrat non annulé existe déjà pour ce lot de vente. | VE-04, VE-05 |
| `LOT_VENTE_NON_PRET` | 409 | Le lot de vente est encore `en_composition`. | DE-07, VE-05 |
| `MONTANT_SUPERIEUR_AU_RESTE` | 409 | Le montant dépasse ce qui reste à verser, à payer, à régler, à rembourser ou à encaisser. | CO-03, CO-04, CO-05, CO-08, CO-09, CO-19, RH-12 |
| `MONTANT_SUPERIEUR_A_LA_DEMANDE` | 409 | Le montant accordé dépasse le montant demandé. | CO-02 |
| `MOT_DE_PASSE_ACTUEL_INCORRECT` | 409 | Le mot de passe actuel ne correspond pas. | SE-02 |
| `MOUVEMENT_DEJA_ANNULE` | 409 | Ce mouvement a déjà été contre-passé. | CO-07 |
| `MOUVEMENT_RAPPROCHE` | 409 | Le mouvement figure dans un rapprochement bancaire validé. | CO-07 |
| `NIVEAU_INCOHERENT` | 409 | Le niveau doit être plus bas que celui du parent. | AD-09 |
| `NUMERO_DEJA_UTILISE` | 409 | Ce numéro existe déjà. | CO-30 |
| `OBJECTIF_DEJA_FIXE` | 409 | Un objectif existe déjà pour cette campagne, cette zone et ce superviseur : le modifier. | PI-01 |
| `OPERATIONS_EN_COURS` | 409 | Clôture refusée tant qu'il reste des pesées à valider ou à payer, des lots non vendus ou des avances non soldées ; `details` les compte. | AD-08 |
| `PAIE_DEJA_VALIDEE` | 409 | La paie du mois est validée : les présences de ce mois ne changent plus. | RH-04 |
| `PAIE_NON_VALIDEE` | 409 | Pas de salaire payé sans paie validée par le gérant. | RH-12 |
| `PERIMETRE_REQUIS` | 409 | Rôle de terrain ou de dépôt sans zone ni dépôt. | AD-01 |
| `PERIODES_OUVERTES` | 409 | Clôture de l'exercice refusée tant qu'un mois est ouvert. | CO-27 |
| `PERIODE_CLOTUREE` | 409 | La date de l'opération tombe dans une période comptable clôturée. | TE-06, VE-07, CO-03, CO-07, CO-08, CO-09, CO-18, CO-19, CO-23, CO-24 |
| `PERIODE_TROP_LONGUE` | 422 | Période de plus d'un an. | CO-22 |
| `PESEE_BLOQUEE_HUMIDITE` | 409 | L'humidité dépassait le maximum à l'achat : la pesée doit être corrigée après séchage. | CO-08 |
| `PESEE_PAYEE` | 409 | Un paiement existe : l'annuler d'abord en Comptabilité (CO-08). | TE-07 |
| `POIDS_SUPERIEUR_AU_STOCK` | 409 | Le poids de sortie dépasse le poids du lot : `details` donne le stock. | DE-07 |
| `PRIX_ABSENT` | 409 | Aucun prix d'achat en vigueur à cette date pour ce produit. | TE-05, AD-08 |
| `PRODUCTEUR_DEJA_LIE` | 409 | Ce producteur a déjà un compte (`producteurs.utilisateur_id` est unique). | AD-01 |
| `PRODUCTEUR_NON_ACTIF` | 409 | Dossier `incomplet` ou producteur `suspendu`. | CO-01 |
| `ROLE_SYSTEME` | 409 | Le code d'un rôle livré (`est_systeme` = 1) ne se modifie pas ; ses droits, oui. | AD-02 |
| `SACS_DEJA_RECUS` | 409 | Les sacs sont déjà entrés au dépôt : l'écart se traite à l'entrée, pas à la pesée. | TE-07 |
| `SAC_DEJA_ENVOYE` | 409 | Un sac figure déjà sur un autre bordereau : `details` donne les sacs en cause. | TE-08 |
| `SAC_DEJA_UTILISE` | 409 | Un numéro de sac figure deux fois dans la pesée. | TE-05 |
| `SCAN_MANQUANT` | 409 | Aucune pièce jointe sur ce document. | VE-11 |
| `SESSION_EXPIREE` | 401 | Jeton absent, expiré ou révoqué : l'intercepteur ouvre `default-session-expired` et renvoie vers `/auth`. | SE-03 |
| `SOLDE_INSUFFISANT` | 409 | Le compte de trésorerie n'a pas ce solde : `details` le donne. | CO-03, CO-08, CO-11, CO-19, RH-12 |
| `SORTIE_NON_FAITE` | 409 | Le lot de vente n'est pas encore sorti du dépôt. | VE-13 |
| `TAUX_ABSENT` | 409 | Aucun taux de change saisi pour cette devise à cette date. | VE-04, VE-14, CO-17 |
| `TAUX_DEJA_SAISI` | 409 | Un taux existe pour cette devise à cette date : le corriger par `PUT taux-change/{id}`, possible tant qu'aucune opération ne l'a copié. | AD-12 |
| `TELEPHONE_DEJA_UTILISE` | 409 | Ce numéro est déjà celui d'un autre compte ou d'un autre producteur. | TE-01, AD-01 |
| `TIERS_REQUIS` | 422 | Compte collectif sans tiers. | CO-23 |
| `TROP_DE_TENTATIVES` | 429 | Trop d'essais ratés : attendre avant de réessayer. | SE-01 |
| `TYPE_DE_FICHIER_REFUSE` | 415 | Ni image ni PDF. | SE-07 |
| `VALEUR_INVALIDE` | 422 | La valeur ne correspond pas au type du paramètre. | AD-11 |
| `VENTE_NON_CONFIRMEE` | 409 | Le contrat est encore `brouillon` ou a été annulé. | VE-06 |
| `VILLAGE_HORS_PERIMETRE` | 403 | Le village n'est pas dans la zone du superviseur. | TE-01 |

---

## 17. Compteurs des menus

`MENUS.md` (§8.2) laissait dix conditions « à préciser ». Les états de la base permettent de les fixer ; la dernière colonne dit quelles actions font bouger le compteur, donc après lesquelles le rafraîchir (SE-06).

| Application | Compteur (`id` du menu) | Condition | Actions qui le changent |
|---|---|---|---|
| Pilotage | `alertes` | `alertes.statut` = `ouverte`, dans ses zones | PI-02 ; toute action qui lève une alerte |
| Pilotage | `approbations` | `approbations.decision` = `en_attente`, demandées par un autre que lui | PI-03, CO-02, CO-01, DE-03, CO-10 |
| Producteurs et collecte | `pesees` | `pesees.statut` = `saisie` | TE-05, TE-06 |
| Producteurs et collecte | `envois` | `bordereaux.statut` = `prepare` | TE-08, TE-09 |
| Dépôts et traitement | `entrees` | `bordereaux.statut` = `envoye`, à destination de son dépôt | TE-09, DE-01 |
| Dépôts et traitement | `lots` | `lots.statut` = `bloque` | DE-05, PI-03 |
| Dépôts et traitement | `sorties` | **précisé** — `lots_vente.statut` = `pret`, avec au moins un lot de sa composition encore en stock dans son dépôt | VE-03, DE-07 |
| Ventes et import-export | `factures` | `factures.statut` = `brouillon` | VE-06, VE-07 |
| Ventes et import-export | `encaissements` | `factures.statut` = `emise` ou `payee_partiel`, et `ventes.date_echeance` dépassée | VE-07, CO-09 |
| Ventes et import-export | `dossiers-export` | **précisé** — `dossiers_export.statut` = `en_preparation` et `est_complet` = 0 | VE-05, VE-09, VE-11, VE-13 |
| Comptabilité | `avances-validation` | `avances.statut` = `proposee`, demandées par un autre que lui | CO-01, CO-02, PI-03 |
| Comptabilité | `avances-decaissement` | `avances.statut` = `validee` | CO-02, CO-03 |
| Comptabilité | `avances-sans-livraison` | `avances.statut` = `en_retard` | le contrôle de nuit du serveur ; CO-04, CO-05, TE-06 |
| Comptabilité | `tresorerie-paiements-producteurs` | `pesees.statut` = `validee` et `est_bloquee_humidite` = 0 | TE-06, CO-08 |
| Comptabilité | `tresorerie-encaissements` | `factures.statut` = `emise` ou `payee_partiel` | VE-07, CO-09 |
| Comptabilité | `tresorerie-transferts` | **précisé** — `transferts_fonds.statut` = `valide`, vers un compte dont il est le responsable | CO-11, CO-12 |
| Comptabilité | `depenses-liste` | **précisé** — `depenses.statut` = `saisie` | CO-17, VE-12, CO-18 |
| Comptabilité | `depenses-reglements` | **précisé** — `depenses.statut` = `validee` ou `payee_partiel` | CO-18, CO-19 |
| Comptabilité | `generale-ecritures` | **précisé** — `ecritures.statut` = `brouillard` | CO-23, CO-24 |
| Ressources humaines | `contrats` | **précisé** — `contrats_travail.statut` = `actif` et `date_fin` dans le délai du paramètre `ALERTE_FIN_CONTRAT_JOURS` | RH-02 |
| Ressources humaines | `conges` | **précisé** — `conges.statut` = `demande` | RH-05, RH-06 |
| Ressources humaines | `avances-salaire` | **précisé** — `avances_salaire.statut` = `demandee` | RH-10, RH-11 |
| Ressources humaines | `paiements` | **précisé** — `bulletins.statut` = `valide` | RH-09, RH-12 |

---

## 18. Des permissions aux actions

Les 85 permissions de lecture ouvrent les pages (`MENUS.md`, §9). Les 85 autres portent les actions de ce guide :

**Pilotage**

| Permission | Actions |
|---|---|
| `pilotage.objectif.saisir` | PI-01 Fixer un objectif de collecte |
| `pilotage.alerte.traiter` | PI-02 Traiter une alerte |
| `pilotage.approbation.decider` | PI-03 Décider une approbation |

**Producteurs et collecte**

| Permission | Actions |
|---|---|
| `terrain.pesee.saisir` | TE-05 Enregistrer une pesée |
| `terrain.producteur.saisir` | TE-01 Créer un producteur · TE-02 Suspendre ou réactiver un producteur |
| `terrain.champ.saisir` | TE-03 Enregistrer un champ |
| `terrain.visite.saisir` | TE-04 Enregistrer une visite |
| `terrain.pesee.valider` | TE-06 Valider une pesée |
| `terrain.pesee.corriger` | TE-07 Corriger une pesée validée |
| `terrain.bordereau.saisir` | TE-08 Préparer un bordereau d'envoi · TE-09 Envoyer le bordereau |

**Dépôts et traitement**

| Permission | Actions |
|---|---|
| `depots.entree.saisir` | DE-01 Recevoir un bordereau · DE-02 Valider l'entrée et ranger les sacs dans un lot |
| `depots.traitement.saisir` | DE-04 Démarrer une étape de traitement · DE-05 Terminer une étape de traitement |
| `depots.mesure.saisir` | DE-06 Relever une mesure |
| `depots.lot.justifier` | DE-03 Justifier un lot bloqué |
| `depots.sortie.saisir` | DE-07 Enregistrer une sortie |
| `depots.inventaire.saisir` | DE-08 Ouvrir un inventaire · DE-09 Saisir les poids comptés |
| `depots.inventaire.valider` | DE-10 Valider un inventaire |

**Ventes et import-export**

| Permission | Actions |
|---|---|
| `ventes.client.saisir` | VE-01 Créer un client |
| `ventes.lot-vente.saisir` | VE-02 Composer un lot de vente · VE-03 Déclarer le lot de vente prêt |
| `ventes.contrat.saisir` | VE-04 Préparer un contrat de vente |
| `ventes.contrat.confirmer` | VE-05 Confirmer un contrat |
| `ventes.facture.emettre` | VE-06 Préparer une facture · VE-07 Émettre une facture |
| `ventes.facture.annuler` | VE-08 Annuler une facture par un avoir |
| `ventes.dossier-export.saisir` | VE-09 Ouvrir ou compléter un dossier d'export · VE-10 Enregistrer un document reçu |
| `ventes.document.valider` | VE-11 Valider ou rejeter un document |
| `ventes.frais.saisir` | VE-12 Ajouter un frais au dossier |
| `ventes.expedition.saisir` | VE-13 Suivre une expédition |
| `ventes.dossier-import.saisir` | VE-14 Ouvrir un dossier d'import · VE-15 Faire avancer un dossier d'import |
| `ventes.type-document.saisir` | VE-16 Régler la liste des documents exigés |

**Comptabilité**

| Permission | Actions |
|---|---|
| `comptabilite.avance.valider` | CO-02 Décider une avance |
| `comptabilite.avance.verser` | CO-03 Verser une avance |
| `comptabilite.export.faire` | CO-22 Exporter un état |
| `comptabilite.avance.demander` | CO-01 Demander une avance |
| `comptabilite.avance.rembourser` | CO-04 Enregistrer un remboursement en espèces |
| `comptabilite.avance.abandonner` | CO-05 Abandonner le reste dû d'une avance |
| `comptabilite.tresorerie.saisir` | CO-06 Créer ou modifier un compte de trésorerie · CO-07 Contre-passer un mouvement |
| `comptabilite.paiement-producteur.payer` | CO-08 Payer une pesée |
| `comptabilite.encaissement.saisir` | CO-09 Encaisser une facture |
| `comptabilite.transfert.demander` | CO-10 Demander un transfert de fonds |
| `comptabilite.transfert.valider` | CO-11 Valider un transfert de fonds |
| `comptabilite.transfert.recevoir` | CO-12 Recevoir un transfert de fonds |
| `comptabilite.cloture-caisse.saisir` | CO-13 Clôturer une caisse |
| `comptabilite.cloture-caisse.valider` | CO-14 Valider une clôture de caisse |
| `comptabilite.rapprochement.saisir` | CO-15 Ouvrir un rapprochement et pointer |
| `comptabilite.rapprochement.valider` | CO-16 Valider un rapprochement |
| `comptabilite.depense.saisir` | CO-17 Saisir une dépense |
| `comptabilite.depense.valider` | CO-18 Valider une dépense |
| `comptabilite.reglement.payer` | CO-19 Régler une dépense |
| `comptabilite.fournisseur.saisir` | CO-20 Créer un fournisseur |
| `comptabilite.nature-depense.saisir` | CO-21 Créer ou modifier une nature de dépense |
| `comptabilite.ecriture.saisir` | CO-23 Saisir une écriture manuelle |
| `comptabilite.ecriture.valider` | CO-24 Valider une écriture |
| `comptabilite.ecriture.extourner` | CO-25 Extourner une écriture |
| `comptabilite.lettrage.saisir` | CO-26 Lettrer des lignes |
| `comptabilite.exercice.cloturer` | CO-27 Clôturer une période ou un exercice |
| `comptabilite.immobilisation.saisir` | CO-28 Enregistrer une immobilisation |
| `comptabilite.etat.parametrer` | CO-29 Paramétrer un poste d'état financier |
| `comptabilite.compte.saisir` | CO-30 Créer ou modifier un compte · CO-34 Régler les comptes d'un produit |
| `comptabilite.journal.saisir` | CO-31 Créer ou modifier un journal |
| `comptabilite.tiers.saisir` | CO-32 Créer un tiers |
| `comptabilite.modele.saisir` | CO-33 Régler un modèle d'écriture |
| `comptabilite.taxe.saisir` | CO-35 Créer ou modifier une taxe |

**Ressources humaines**

| Permission | Actions |
|---|---|
| `rh.employe.saisir` | RH-01 Créer ou modifier un employé |
| `rh.contrat.saisir` | RH-02 Enregistrer un contrat de travail |
| `rh.organisation.saisir` | RH-03 Créer ou modifier un service ou un poste |
| `rh.presence.saisir` | RH-04 Saisir les présences d'une journée |
| `rh.conge.demander` | RH-05 Demander un congé |
| `rh.conge.decider` | RH-06 Décider un congé |
| `rh.mission.saisir` | RH-07 Ordonner une mission |
| `rh.paie.calculer` | RH-08 Ouvrir et calculer la paie d'un mois |
| `rh.paie.valider` | RH-09 Valider la paie d'un mois |
| `rh.avance-salaire.saisir` | RH-10 Demander une avance sur salaire |
| `rh.avance-salaire.decider` | RH-11 Décider une avance sur salaire |
| `rh.salaire.payer` | RH-12 Payer un salaire |
| `rh.rubrique.saisir` | RH-13 Régler une rubrique de paie et son barème |

**Administration**

| Permission | Actions |
|---|---|
| `administration.utilisateur.saisir` | AD-01 Créer un utilisateur |
| `administration.role.saisir` | AD-02 Créer ou modifier un rôle et ses droits |
| `administration.produit.saisir` | AD-03 Créer ou modifier un produit · AD-04 Ouvrir de nouvelles règles à partir d'une date · AD-05 Fixer un prix d'achat à partir d'une date · AD-06 Définir les étapes de traitement |
| `administration.campagne.saisir` | AD-07 Créer ou modifier une campagne · AD-08 Ouvrir ou clôturer une campagne |
| `administration.zone.saisir` | AD-09 Créer ou modifier une zone |
| `administration.depot.saisir` | AD-10 Créer ou modifier un dépôt |
| `administration.parametre.saisir` | AD-11 Ouvrir une nouvelle valeur à partir d'une date |
| `administration.devise.saisir` | AD-12 Saisir le taux du jour |
| `administration.societe.saisir` | AD-13 Modifier l'identité de la société |
| `administration.compteur.saisir` | AD-14 Régler le préfixe ou la longueur d'un numéro |

---

## 19. Points à confirmer

**Avec l'API (à trancher avant de coder les services)**

1. **Les adresses du §1.1.** `PUT` pour modifier, aucun `DELETE`. Si l'hébergement ne laisse passer que `GET` et `POST`, remplacer chaque `PUT <ressource>/{id}` par `POST <ressource>/{id}/modifier` : rien d'autre ne change.
2. **La réponse de la connexion** : `{ token, user }`, comme l'attend `AuthService` dans `ARCHITECTURE.md` (§13.3).
3. **Le nom des motifs de refus** (§16) et la forme du corps d'erreur (§1.7).
4. **Les requêtes de préparation** (§1.9) : leur liste, et les clés qu'elles renvoient.
5. **Date et heure** au format `AAAA-MM-JJ HH:MM:SS`, à l'heure universelle.
6. **Taille et types des fichiers** acceptés par SE-07.

**Règles de gestion que la base ne tranche pas (ce guide a retenu la première lecture)**

7. **Dossier d'un producteur** : il passe de `incomplet` à `actif` quand la pièce d'identité et un champ au moins sont enregistrés. À confirmer avec le client.
8. **Pesée trop humide** : elle s'enregistre et se valide, c'est son **paiement** qui est bloqué ; elle se débloque par une correction (TE-07). La nouvelle version naît `validee`.
9. **Entrée au dépôt en deux temps** : reçue (poids, écart), puis validée (rangement dans un lot, création du stock). `contestee` suspend la création du stock.
10. **Signe de l'écart de réception** : ce guide et `chaine.util.ts` écrivent *reçu − annoncé* (−4 kg) ; le scénario d'essai de la base stocke 4 et 0,27 en positif. Un seul sens à retenir pour `entrees_depot.ecart_kg`.
11. **Coût du transport** : `bordereaux.cout_transport` est le montant convenu ; c'est la dépense rattachée au bordereau qui entre dans le coût du lot. À vérifier pour ne pas le compter deux fois.
12. **Numéro de facture** : `factures.numero` est obligatoire dès le brouillon, alors que la suite des numéros ne doit pas avoir de trou. Numéro provisoire en brouillon, définitif à l'émission ?
13. **Annuler un règlement, un encaissement, un salaire** : leurs tables n'ont pas de colonne `est_annule`. Ce guide passe par la contre-passation du mouvement de trésorerie (CO-07).
14. **Annuler un contrat et marquer une vente locale livrée** : rattachés à `ventes.contrat.confirmer`, faute de permission propre.
15. **Remboursement d'avance en espèces** : `avance_remboursements` n'a pas de `reference_unique` ; ce guide la fait porter par le mouvement de trésorerie.
16. **Numéros de sac** : lus sur une étiquette, ou attribués par le serveur quand la pesée ne détaille pas ses sacs.
17. **Lot de vente `vendu`** : ce guide le fait passer à `vendu` à la confirmation du contrat ; le scénario d'essai de la base le pose dès la sortie du dépôt.
18. **Ressources humaines** : types de congé réglés avec `rh.conge.decider`, avance sur salaire versée avec `rh.salaire.payer`.

**Entre les trois guides**

19. **Codes des rôles** : `MENUS.md` (§10) utilise des codes provisoires en minuscules pour ses utilisateurs de démonstration ; la base livre `ADMIN`, `COMPTABLE`, `SUPERVISEUR`, `PRODUCTEUR`, `TRAITEMENT`, `VENTES`, `IMPORT_EXPORT`. Ce sont ceux de la base qui font foi.
20. **Les questions encore ouvertes d'`ARCHITECTURE.md` (§22)** restent ouvertes : ce guide n'en dépend pas.
