/**
 * Registre des schémas (colonnes + champs + mocks + KPIs) par route de module.
 * Issu de ACTION.md — adapté à la structure BDD avant l'arrivée des endpoints réels.
 */
import { FormField } from '../../../administration/shared/dialogs/entity-form/entity-form.types';
import { DataTableColumn } from '../data-table/data-table.component';
import { ModulePageConfig } from './module-page.types';

type Kpi = { label: string; value: string; note?: string; tone?: 'ok' | 'wait' | 'info' | 'danger' | 'neutral' };

interface ScreenSchema {
  title: string;
  subtitle?: string;
  icon?: string;
  breadcrumb?: string[];
  entityLabel: string;
  dialogSize?: 'sm' | 'md' | 'lg' | 'xl';
  columns: DataTableColumn<any>[];
  fields: FormField[];
  rows: () => any[];
  kpis?: Kpi[];
  initialValues?: Record<string, any>;
  trackByKey?: string;
}

// ---------- helpers ----------
const d = (offset = 0) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
const money = (n: number) => n.toLocaleString('fr-FR') + ' GNF';
const kg = (n: number) => n.toLocaleString('fr-FR') + ' kg';
const pct = (n: number) => n.toFixed(1).replace('.', ',') + ' %';

const PRODUCTEURS = ['Mamadou BAH', 'Aïssata DIALLO', 'Sékou CAMARA', 'Fatoumata SOW', 'Ibrahima KEITA', 'Mariama TRAORÉ', 'Alpha BARRY', 'Kadiatou SYLLA'];
const ZONES = ['Kolaboui', 'Kindia', 'Boké', 'Mamou', 'Labé'];
const VILLAGES = ['Kolaboui-Centre', 'Kataco', 'Sangaredi', 'Télémélé', 'Dalaba', 'Koba'];
const PRODUITS = ['Cajou', 'Cacao', 'Café', 'Karité'];
const CLIENTS = ['Olam International', 'Cargill SA', 'Vietnam Cashew Co.', 'Barry Callebaut', 'Nestlé', 'Blommer Chocolate'];
const FOURNISSEURS = ['Sylla Transport', 'Camara Négoce', 'Fournitures Boké SA', 'TotalEnergies Guinée', 'BICIGUI'];
const DEPOTS = ['Dépôt Kindia', 'Dépôt Boké', 'Entrepôt Conakry'];
const COMPTES = ['Caisse Kindia', 'Caisse Boké', 'Banque BICIGUI 00123', 'Orange Money'];
const MODES = ['Espèces', 'Orange Money', 'Virement bancaire', 'Chèque'];

const pill = (map: Record<string, { label: string; tone: any }>) =>
  (r: any) => map[r.statut] ?? { label: r.statut, tone: 'neutral' };

// ================================================================
// SCHEMAS — par module
// ================================================================

export const ACTION_SCHEMAS: Record<string, ScreenSchema> = {

  // ------------------ TERRAIN ------------------
  'terrain/producteurs': {
    title: 'Producteurs',
    subtitle: 'Fiches producteurs — identité, village, produits cultivés.',
    icon: 'users',
    breadcrumb: ['Producteurs et collecte', 'Producteurs'],
    entityLabel: 'producteur',
    dialogSize: 'lg',
    columns: [
      { key: 'code', label: 'Code', width: 110, minWidth: 90, sortable: true },
      { key: 'nom_complet', label: 'Nom complet', width: 200, minWidth: 140, sortable: true },
      { key: 'telephone', label: 'Téléphone', width: 130, minWidth: 110 },
      { key: 'village', label: 'Village', width: 150, minWidth: 110, hideOnMobile: true },
      { key: 'produits', label: 'Produits', width: 150, minWidth: 110, hideOnMobile: true },
      { key: 'nb_champs', label: 'Champs', width: 90, minWidth: 70, align: 'right' },
      { key: 'statut', label: 'Statut', width: 120, minWidth: 100,
        pill: pill({ actif: { label: 'Actif', tone: 'ok' }, suspendu: { label: 'Suspendu', tone: 'wait' }, sorti: { label: 'Sorti', tone: 'off' }, incomplet: { label: 'Incomplet', tone: 'neutral' } }) },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'ex. BAH' },
      { key: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'ex. Mamadou' },
      { key: 'telephone', label: 'Téléphone', type: 'tel', required: true, placeholder: '620 00 00 00',
        hint: 'Sert à identifier le producteur et recevoir les notifications.' },
      { key: 'sexe', label: 'Sexe', type: 'select', options: [{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }] },
      { key: 'date_naissance', label: 'Date de naissance', type: 'date' },
      { key: 'village', label: 'Village', type: 'select', required: true,
        options: VILLAGES.map(v => ({ value: v, label: v })) },
      { key: 'date_adhesion', label: 'Date d\'adhésion', type: 'date', required: true },
      { key: 'piece_identite', label: 'Pièce d\'identité', type: 'text', placeholder: 'N° CNI, passeport' },
      { key: 'produit_ids', label: 'Produits cultivés', type: 'select', required: true,
        options: PRODUITS.map(p => ({ value: p, label: p })) },
      { key: 'notes', label: 'Observations', type: 'textarea', cols: 1, placeholder: 'Remarques sur le producteur.' },
    ],
    initialValues: { date_adhesion: d(0) },
    rows: () => Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      code: 'PR-' + String(i + 1).padStart(4, '0'),
      nom_complet: PRODUCTEURS[i % PRODUCTEURS.length],
      telephone: '62' + String(1000000 + i * 123).slice(0, 7),
      village: VILLAGES[i % VILLAGES.length],
      produits: PRODUITS[i % PRODUITS.length],
      nb_champs: (i % 4) + 1,
      statut: ['actif', 'actif', 'actif', 'suspendu'][i % 4],
    })),
    kpis: [
      { label: 'Producteurs actifs', value: '1 487', note: 'sur 1 500+', tone: 'ok' },
      { label: 'Nouveaux (30j)', value: '42', tone: 'info' },
      { label: 'Zones couvertes', value: '12', tone: 'neutral' },
      { label: 'Villages', value: '68', tone: 'neutral' },
    ],
  },

  'terrain/champs': {
    title: 'Champs',
    subtitle: 'Parcelles cultivées — surface, nombre d\'arbres, GPS.',
    icon: 'sprout',
    breadcrumb: ['Producteurs et collecte', 'Champs'],
    entityLabel: 'champ',
    dialogSize: 'lg',
    columns: [
      { key: 'code', label: 'Code', width: 110, minWidth: 90, sortable: true },
      { key: 'producteur', label: 'Producteur', width: 200, minWidth: 140, sortable: true },
      { key: 'produit', label: 'Produit', width: 110, minWidth: 90 },
      { key: 'surface_ha', label: 'Surface', width: 120, minWidth: 100, align: 'right',
        format: r => r.surface_ha.toFixed(1).replace('.', ',') + ' ha' },
      { key: 'nombre_arbres', label: 'Arbres', width: 110, minWidth: 90, align: 'right' },
      { key: 'village', label: 'Village', width: 150, minWidth: 110, hideOnMobile: true },
      { key: 'est_actif', label: 'Statut', width: 100, minWidth: 90,
        pill: r => r.est_actif ? { label: 'Actif', tone: 'ok' as const } : { label: 'Inactif', tone: 'off' as const } },
    ],
    fields: [
      { key: 'producteur_id', label: 'Producteur', type: 'select', required: true,
        options: PRODUCTEURS.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'produit', label: 'Produit', type: 'select', required: true, options: PRODUITS.map(p => ({ value: p, label: p })) },
      { key: 'village', label: 'Village', type: 'select', required: true, options: VILLAGES.map(v => ({ value: v, label: v })) },
      { key: 'surface_ha', label: 'Surface', type: 'number', required: true, unite: 'ha', step: 0.1, min: 0, placeholder: '0,0' },
      { key: 'nombre_arbres', label: 'Nombre d\'arbres', type: 'number', min: 0, placeholder: '0' },
      { key: 'estimation_kg', label: 'Récolte estimée', type: 'number', unite: 'kg', min: 0, placeholder: '0' },
      { key: 'latitude', label: 'Latitude GPS', type: 'number', step: 0.000001, placeholder: 'ex. 10.746292' },
      { key: 'longitude', label: 'Longitude GPS', type: 'number', step: 0.000001, placeholder: 'ex. -14.283654' },
      { key: 'notes', label: 'Observations', type: 'textarea', cols: 1, placeholder: 'Accessibilité, topographie…' },
    ],
    initialValues: { est_actif: true },
    rows: () => Array.from({ length: 20 }, (_, i) => ({
      id: i + 1, code: 'CH-' + String(i + 1).padStart(4, '0'),
      producteur: PRODUCTEURS[i % PRODUCTEURS.length],
      produit: PRODUITS[i % PRODUITS.length],
      surface_ha: Math.random() * 6 + 0.5,
      nombre_arbres: Math.round(Math.random() * 1200 + 100),
      village: VILLAGES[i % VILLAGES.length],
      est_actif: i % 5 !== 0,
    })),
  },

  'terrain/visites': {
    title: 'Visites',
    subtitle: 'Visites terrain — état, stade, estimation.',
    icon: 'clipboard-list',
    breadcrumb: ['Producteurs et collecte', 'Visites'],
    entityLabel: 'visite',
    dialogSize: 'lg',
    columns: [
      { key: 'date_visite', label: 'Date', width: 120, minWidth: 100, sortable: true },
      { key: 'champ', label: 'Champ', width: 120, minWidth: 100 },
      { key: 'producteur', label: 'Producteur', width: 180, minWidth: 140 },
      { key: 'etat_champ', label: 'État', width: 110, minWidth: 90,
        pill: r => ({ bon: { label: 'Bon', tone: 'ok' as const }, moyen: { label: 'Moyen', tone: 'wait' as const }, mauvais: { label: 'Mauvais', tone: 'danger' as const } }[r.etat_champ as string] ?? { label: r.etat_champ, tone: 'neutral' as const }) },
      { key: 'stade', label: 'Stade', width: 140, minWidth: 110, hideOnMobile: true },
      { key: 'estimation_kg', label: 'Estimation', width: 130, minWidth: 110, align: 'right',
        format: r => r.estimation_kg ? kg(r.estimation_kg) : '—' },
    ],
    fields: [
      { key: 'champ_id', label: 'Champ', type: 'select', required: true,
        options: Array.from({ length: 20 }, (_, i) => ({ value: i + 1, label: 'CH-' + String(i + 1).padStart(4, '0') })) },
      { key: 'date_visite', label: 'Date de visite', type: 'date', required: true },
      { key: 'etat_champ', label: 'État du champ', type: 'select', required: true,
        options: [{ value: 'bon', label: 'Bon' }, { value: 'moyen', label: 'Moyen' }, { value: 'mauvais', label: 'Mauvais' }] },
      { key: 'stade', label: 'Stade phénologique', type: 'select', required: true,
        options: [{ value: 'repos', label: 'Repos végétatif' }, { value: 'floraison', label: 'Floraison' }, { value: 'fructification', label: 'Fructification' }, { value: 'recolte', label: 'Récolte' }] },
      { key: 'estimation_kg', label: 'Estimation récolte', type: 'number', unite: 'kg', min: 0, placeholder: '0' },
      { key: 'observations', label: 'Observations', type: 'textarea', cols: 1, required: true,
        placeholder: 'Conseils donnés, anomalies constatées, actions à prévoir.' },
    ],
    initialValues: { date_visite: d(0), etat_champ: 'bon' },
    rows: () => Array.from({ length: 15 }, (_, i) => ({
      id: i + 1, date_visite: d(i * 2),
      champ: 'CH-' + String((i % 20) + 1).padStart(4, '0'),
      producteur: PRODUCTEURS[i % PRODUCTEURS.length],
      etat_champ: ['bon', 'bon', 'moyen', 'bon', 'mauvais'][i % 5],
      stade: ['Floraison', 'Fructification', 'Récolte', 'Repos'][i % 4],
      estimation_kg: Math.round(Math.random() * 800 + 200),
    })),
  },

  'terrain/pesees': {
    title: 'Pesées',
    subtitle: 'Pesées à la récolte — chaque pesée génère un reçu.',
    icon: 'scale',
    breadcrumb: ['Producteurs et collecte', 'Collecte'],
    entityLabel: 'pesée',
    dialogSize: 'lg',
    columns: [
      { key: 'numero', label: 'N°', width: 150, minWidth: 130, sortable: true },
      { key: 'date_pesee', label: 'Date', width: 110, minWidth: 100, sortable: true },
      { key: 'producteur', label: 'Producteur', width: 180, minWidth: 140 },
      { key: 'poids_net_kg', label: 'Net', width: 110, minWidth: 90, align: 'right', format: r => kg(r.poids_net_kg) },
      { key: 'humidite_pct', label: 'Humidité', width: 110, minWidth: 90, align: 'right', format: r => pct(r.humidite_pct) },
      { key: 'net_a_payer', label: 'Net à payer', width: 160, minWidth: 130, align: 'right', format: r => money(r.net_a_payer) },
      { key: 'statut', label: 'Statut', width: 120, minWidth: 100,
        pill: pill({ saisie: { label: 'Saisie', tone: 'neutral' }, validee: { label: 'À payer', tone: 'wait' }, payee: { label: 'Payée', tone: 'ok' }, remplacee: { label: 'Remplacée', tone: 'off' }, annulee: { label: 'Annulée', tone: 'off' } }) },
    ],
    fields: [
      { key: 'date_pesee', label: 'Date de pesée', type: 'date', required: true },
      { key: 'producteur_id', label: 'Producteur', type: 'select', required: true,
        options: PRODUCTEURS.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'champ_id', label: 'Champ', type: 'select',
        options: Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: 'CH-' + String(i + 1).padStart(4, '0') })) },
      { key: 'produit', label: 'Produit', type: 'select', required: true, options: PRODUITS.map(p => ({ value: p, label: p })) },
      { key: 'nombre_sacs', label: 'Nombre de sacs', type: 'number', required: true, min: 1, placeholder: '0' },
      { key: 'poids_brut_kg', label: 'Poids brut', type: 'number', required: true, unite: 'kg', step: 0.001, min: 0 },
      { key: 'tare_kg', label: 'Tare', type: 'number', unite: 'kg', step: 0.001, min: 0 },
      { key: 'humidite_pct', label: 'Humidité', type: 'number', required: true, unite: '%', step: 0.1, min: 0, max: 100, placeholder: '14,0' },
      { key: 'prix_kg', label: 'Prix au kg', type: 'number', unite: 'GNF/kg', min: 0, hint: 'Laisser vide pour le prix du jour.' },
    ],
    initialValues: { date_pesee: d(0), humidite_pct: 14 },
    rows: () => Array.from({ length: 20 }, (_, i) => {
      const net = Math.round(Math.random() * 400 + 50);
      const prix = [5500, 6000, 7200, 8500][i % 4];
      return {
        id: i + 1, numero: 'PE-2026-' + String(i + 1200).padStart(6, '0'),
        date_pesee: d(i), producteur: PRODUCTEURS[i % PRODUCTEURS.length],
        poids_net_kg: net, humidite_pct: Math.random() * 6 + 10,
        prix_kg: prix, net_a_payer: Math.round(net * prix * 0.85),
        statut: ['validee', 'payee', 'saisie', 'validee', 'payee'][i % 5],
      };
    }),
    kpis: [
      { label: 'Pesées (semaine)', value: '284', note: '+12% vs sem-1', tone: 'info' },
      { label: 'Tonnage net', value: '42,8 t', tone: 'ok' },
      { label: 'À payer', value: '18', tone: 'wait' },
      { label: 'Bloquées humidité', value: '3', tone: 'danger' },
    ],
  },

  'terrain/envois': {
    title: 'Envois au dépôt',
    subtitle: 'Bordereaux d\'envoi — préparer, envoyer, suivre la réception.',
    icon: 'truck',
    breadcrumb: ['Producteurs et collecte', 'Collecte'],
    entityLabel: 'bordereau',
    dialogSize: 'lg',
    columns: [
      { key: 'numero', label: 'N°', width: 150, minWidth: 120, sortable: true },
      { key: 'date_envoi', label: 'Envoi', width: 120, minWidth: 100, sortable: true },
      { key: 'depot', label: 'Dépôt', width: 150, minWidth: 110 },
      { key: 'nb_sacs', label: 'Sacs', width: 80, minWidth: 60, align: 'right' },
      { key: 'poids_total_kg', label: 'Poids', width: 130, minWidth: 100, align: 'right', format: r => kg(r.poids_total_kg) },
      { key: 'transporteur', label: 'Transporteur', width: 160, minWidth: 120, hideOnMobile: true },
      { key: 'statut', label: 'Statut', width: 130, minWidth: 110,
        pill: pill({ prepare: { label: 'Préparé', tone: 'neutral' }, envoye: { label: 'Envoyé', tone: 'info' }, recu: { label: 'Reçu', tone: 'ok' } }) },
    ],
    fields: [
      { key: 'date_envoi', label: 'Date d\'envoi', type: 'date', required: true },
      { key: 'depot_id', label: 'Dépôt destinataire', type: 'select', required: true,
        options: DEPOTS.map((d, i) => ({ value: i + 1, label: d })) },
      { key: 'transporteur', label: 'Transporteur', type: 'text', required: true, placeholder: 'ex. Sylla Transport' },
      { key: 'immatriculation', label: 'Immatriculation', type: 'text', placeholder: 'ex. RCJ-1234 AB' },
      { key: 'nb_sacs', label: 'Nombre de sacs', type: 'number', required: true, min: 1 },
      { key: 'cout_transport', label: 'Coût transport', type: 'number', unite: 'GNF', min: 0 },
    ],
    rows: () => Array.from({ length: 15 }, (_, i) => ({
      id: i + 1, numero: 'BO-2026-' + String(i + 100).padStart(6, '0'),
      date_envoi: d(i),
      depot: DEPOTS[i % DEPOTS.length],
      nb_sacs: Math.floor(Math.random() * 100 + 20),
      poids_total_kg: Math.round(Math.random() * 3000 + 500),
      transporteur: ['Sylla Transport', 'Camara SA', 'Bah Logistic'][i % 3],
      statut: ['prepare', 'envoye', 'recu'][i % 3],
    })),
  },

  // ------------------ DEPOTS ------------------
  'depots/entrees': {
    title: 'Entrées au dépôt',
    subtitle: 'Réception des bordereaux — validation, écart, rangement.',
    icon: 'package',
    breadcrumb: ['Dépôts et traitement', 'Réception'],
    entityLabel: 'entrée',
    dialogSize: 'lg',
    columns: [
      { key: 'numero', label: 'N°', width: 140, minWidth: 120, sortable: true },
      { key: 'date_entree', label: 'Date', width: 110, minWidth: 100, sortable: true },
      { key: 'bordereau', label: 'Bordereau', width: 150, minWidth: 130 },
      { key: 'poids_bordereau_kg', label: 'P. bordereau', width: 130, minWidth: 110, align: 'right', format: r => kg(r.poids_bordereau_kg) },
      { key: 'poids_recu_kg', label: 'P. reçu', width: 120, minWidth: 100, align: 'right', format: r => kg(r.poids_recu_kg) },
      { key: 'ecart_pct', label: 'Écart', width: 100, minWidth: 80, align: 'right', format: r => pct(r.ecart_pct) },
      { key: 'statut', label: 'Statut', width: 130, minWidth: 110,
        pill: pill({ recue: { label: 'Reçue', tone: 'wait' }, validee: { label: 'Validée', tone: 'ok' }, contestee: { label: 'Contestée', tone: 'danger' } }) },
    ],
    fields: [
      { key: 'bordereau_id', label: 'Bordereau d\'envoi', type: 'select', required: true,
        options: Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: 'BO-2026-' + String(i + 100).padStart(6, '0') })) },
      { key: 'date_entree', label: 'Date d\'entrée', type: 'date', required: true },
      { key: 'poids_recu_kg', label: 'Poids réellement reçu', type: 'number', required: true, unite: 'kg', step: 0.001, min: 0 },
      { key: 'humidite_pct', label: 'Humidité', type: 'number', unite: '%', step: 0.1, min: 0, max: 100, placeholder: '14,0' },
      { key: 'justification', label: 'Justification écart', type: 'textarea', cols: 1, placeholder: 'Si écart > 2%, expliquer.' },
    ],
    initialValues: { date_entree: d(0) },
    rows: () => Array.from({ length: 15 }, (_, i) => {
      const bo = 3000 + Math.random() * 1000;
      const recu = bo * (0.97 + Math.random() * 0.05);
      return {
        id: i + 1, numero: 'EN-2026-' + String(i + 50).padStart(5, '0'),
        date_entree: d(i),
        bordereau: 'BO-2026-' + String(i + 100).padStart(6, '0'),
        poids_bordereau_kg: Math.round(bo),
        poids_recu_kg: Math.round(recu),
        ecart_pct: ((recu - bo) / bo) * 100,
        statut: ['validee', 'recue', 'contestee', 'validee'][i % 4],
      };
    }),
  },

  'depots/lots': {
    title: 'Lots au dépôt',
    subtitle: 'Lots formés après réception — traitement, qualité, prix.',
    icon: 'layers',
    breadcrumb: ['Dépôts et traitement', 'Lots'],
    entityLabel: 'lot',
    dialogSize: 'lg',
    columns: [
      { key: 'code', label: 'Code', width: 140, minWidth: 120, sortable: true },
      { key: 'produit', label: 'Produit', width: 100, minWidth: 80 },
      { key: 'poids_entree_kg', label: 'Entrée', width: 130, minWidth: 110, align: 'right', format: r => kg(r.poids_entree_kg) },
      { key: 'poids_actuel_kg', label: 'Actuel', width: 130, minWidth: 110, align: 'right', format: r => kg(r.poids_actuel_kg) },
      { key: 'perte_pct', label: 'Perte', width: 100, minWidth: 80, align: 'right', format: r => pct(r.perte_pct) },
      { key: 'humidite_actuelle_pct', label: 'Humidité', width: 110, minWidth: 90, align: 'right', format: r => pct(r.humidite_actuelle_pct) },
      { key: 'depot', label: 'Dépôt', width: 150, minWidth: 110, hideOnMobile: true },
      { key: 'statut', label: 'Statut', width: 150, minWidth: 130,
        pill: pill({ en_traitement: { label: 'En traitement', tone: 'info' }, pret_a_vendre: { label: 'Prêt à vendre', tone: 'ok' }, bloque: { label: 'Bloqué', tone: 'danger' }, vendu: { label: 'Vendu', tone: 'neutral' } }) },
    ],
    fields: [
      { key: 'produit', label: 'Produit', type: 'select', required: true, options: PRODUITS.map(p => ({ value: p, label: p })) },
      { key: 'depot_id', label: 'Dépôt', type: 'select', required: true, options: DEPOTS.map((d, i) => ({ value: i + 1, label: d })) },
      { key: 'poids_entree_kg', label: 'Poids d\'entrée', type: 'number', required: true, unite: 'kg', step: 0.001, min: 0 },
      { key: 'humidite_entree', label: 'Humidité', type: 'number', unite: '%', step: 0.1, min: 0, max: 100 },
      { key: 'date_ouverture', label: 'Date d\'ouverture', type: 'date', required: true },
    ],
    rows: () => Array.from({ length: 18 }, (_, i) => {
      const e = 2000 + Math.random() * 8000;
      const a = e * (0.88 + Math.random() * 0.1);
      return {
        id: i + 1, code: 'LOT-2026-' + String(i + 10).padStart(5, '0'),
        produit: PRODUITS[i % PRODUITS.length],
        poids_entree_kg: Math.round(e),
        poids_actuel_kg: Math.round(a),
        perte_pct: ((e - a) / e) * 100,
        humidite_actuelle_pct: Math.random() * 3 + 8,
        depot: DEPOTS[i % DEPOTS.length],
        statut: ['en_traitement', 'pret_a_vendre', 'vendu', 'bloque'][i % 4],
      };
    }),
  },

  // ------------------ VENTES ------------------
  'ventes/clients': {
    title: 'Clients',
    subtitle: 'Clients locaux et à l\'export — conditions commerciales.',
    icon: 'building-2',
    breadcrumb: ['Ventes et import-export', 'Ventes'],
    entityLabel: 'client',
    dialogSize: 'lg',
    columns: [
      { key: 'code', label: 'Code', width: 100, minWidth: 80, sortable: true },
      { key: 'raison_sociale', label: 'Raison sociale', width: 240, minWidth: 180, sortable: true },
      { key: 'pays', label: 'Pays', width: 130, minWidth: 100 },
      { key: 'est_export', label: 'Type', width: 110, minWidth: 90,
        pill: r => r.est_export ? { label: 'Export', tone: 'info' as const } : { label: 'Local', tone: 'neutral' as const } },
      { key: 'devise', label: 'Devise', width: 80, minWidth: 70 },
      { key: 'encours', label: 'Encours', width: 160, minWidth: 130, align: 'right', format: r => money(r.encours) },
      { key: 'statut', label: 'Statut', width: 110, minWidth: 90,
        pill: pill({ actif: { label: 'Actif', tone: 'ok' }, suspendu: { label: 'Suspendu', tone: 'wait' }, desactif: { label: 'Désactivé', tone: 'off' } }) },
    ],
    fields: [
      { key: 'raison_sociale', label: 'Raison sociale', type: 'text', required: true, cols: 1, placeholder: 'ex. Olam International' },
      { key: 'pays', label: 'Pays', type: 'text', required: true, placeholder: 'ex. Inde' },
      { key: 'ville', label: 'Ville', type: 'text', placeholder: 'ex. Mumbai' },
      { key: 'est_export', label: 'Client à l\'export', type: 'checkbox', hint: 'Si coché, facturation en devise étrangère.' },
      { key: 'devise', label: 'Devise', type: 'select', required: true,
        options: [{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GNF', label: 'GNF' }] },
      { key: 'delai_paiement', label: 'Délai de paiement', type: 'number', unite: 'jours', min: 0 },
      { key: 'contact_nom', label: 'Nom du contact', type: 'text', placeholder: 'ex. John Smith' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'contact@societe.com' },
      { key: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '+XX XX XX XX XX' },
      { key: 'notes', label: 'Notes', type: 'textarea', cols: 1, placeholder: 'Historique commercial, préférences…' },
    ],
    initialValues: { pays: 'Guinée', devise: 'GNF', est_export: false },
    rows: () => Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, code: 'CL-' + String(i + 1).padStart(4, '0'),
      raison_sociale: CLIENTS[i % CLIENTS.length],
      pays: ['Inde', 'Pays-Bas', 'Vietnam', 'Suisse', 'USA', 'France'][i % 6],
      est_export: i % 5 !== 0,
      devise: ['USD', 'EUR', 'USD'][i % 3],
      encours: Math.round(Math.random() * 500_000_000 + 10_000_000),
      statut: ['actif', 'actif', 'suspendu'][i % 3],
    })),
  },

  // ------------------ COMPTABILITÉ ------------------
  'comptabilite/avances/demandes': {
    title: 'Demandes d\'avance',
    subtitle: 'Demandes faites par les superviseurs — chaque demande passe par la validation.',
    icon: 'hand-coins',
    breadcrumb: ['Comptabilité', 'Avances'],
    entityLabel: 'demande',
    dialogSize: 'lg',
    columns: [
      { key: 'numero', label: 'N°', width: 150, minWidth: 130, sortable: true },
      { key: 'date_demande', label: 'Demande', width: 120, minWidth: 100, sortable: true },
      { key: 'producteur', label: 'Producteur', width: 200, minWidth: 140 },
      { key: 'montant_demande', label: 'Demandé', width: 150, minWidth: 130, align: 'right', format: r => money(r.montant_demande) },
      { key: 'plafond', label: 'Plafond', width: 150, minWidth: 130, align: 'right', format: r => money(r.plafond) },
      { key: 'statut', label: 'Statut', width: 150, minWidth: 130,
        pill: pill({ proposee: { label: 'À valider', tone: 'wait' }, validee: { label: 'À verser', tone: 'wait' }, versee: { label: 'Versée', tone: 'info' }, soldee: { label: 'Soldée', tone: 'ok' }, refusee: { label: 'Refusée', tone: 'danger' } }) },
    ],
    fields: [
      { key: 'producteur_id', label: 'Producteur', type: 'select', required: true,
        options: PRODUCTEURS.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'date_demande', label: 'Date de demande', type: 'date', required: true },
      { key: 'montant_demande', label: 'Montant demandé', type: 'number', required: true, unite: 'GNF', min: 0, hint: 'Le plafond est calculé selon la récolte estimée.' },
      { key: 'motif', label: 'Motif de la demande', type: 'select', required: true, options: [
        { value: 'preparation_champ', label: 'Préparation du champ' },
        { value: 'main_oeuvre', label: 'Main d\'œuvre' },
        { value: 'intrants', label: 'Intrants' },
        { value: 'besoin_personnel', label: 'Besoin personnel' },
      ]},
      { key: 'objectif_kg', label: 'Livraison attendue', type: 'number', unite: 'kg', min: 0 },
      { key: 'notes', label: 'Détails', type: 'textarea', cols: 1, required: true, placeholder: 'Précisez l\'utilisation prévue de l\'avance.' },
    ],
    initialValues: { date_demande: d(0) },
    rows: () => Array.from({ length: 15 }, (_, i) => ({
      id: i + 1, numero: 'AV-2026-' + String(i + 100).padStart(6, '0'),
      date_demande: d(i * 3),
      producteur: PRODUCTEURS[i % PRODUCTEURS.length],
      montant_demande: [250000, 500000, 750000, 1000000, 1500000, 2000000][i % 6],
      plafond: [800000, 1200000, 1800000, 2500000][i % 4],
      statut: ['proposee', 'validee', 'versee', 'soldee', 'refusee'][i % 5],
    })),
    kpis: [
      { label: 'À valider', value: '12', tone: 'wait' },
      { label: 'À verser', value: '8', tone: 'wait' },
      { label: 'En retard', value: '3', tone: 'danger' },
      { label: 'Encours', value: '142 M', note: 'GNF', tone: 'info' },
    ],
  },

  // ------------------ RH ------------------
  'rh/employes': {
    title: 'Employés',
    subtitle: 'Dossiers des employés — identité, contrat, poste.',
    icon: 'users',
    breadcrumb: ['Ressources humaines', 'Personnel'],
    entityLabel: 'employé',
    dialogSize: 'lg',
    columns: [
      { key: 'matricule', label: 'Matricule', width: 120, minWidth: 100, sortable: true },
      { key: 'nom_complet', label: 'Nom complet', width: 200, minWidth: 140 },
      { key: 'poste', label: 'Poste', width: 180, minWidth: 140 },
      { key: 'service', label: 'Service', width: 150, minWidth: 110, hideOnMobile: true },
      { key: 'date_embauche', label: 'Embauche', width: 120, minWidth: 100 },
      { key: 'statut', label: 'Statut', width: 120, minWidth: 100,
        pill: pill({ actif: { label: 'Actif', tone: 'ok' }, suspendu: { label: 'Suspendu', tone: 'wait' }, sorti: { label: 'Sorti', tone: 'off' } }) },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'ex. CAMARA' },
      { key: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'ex. Sékou' },
      { key: 'sexe', label: 'Sexe', type: 'select', options: [{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }] },
      { key: 'date_naissance', label: 'Date de naissance', type: 'date' },
      { key: 'telephone', label: 'Téléphone', type: 'tel', required: true, placeholder: '620 00 00 00' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'prenom.nom@sorygroup.com' },
      { key: 'poste', label: 'Poste', type: 'select', required: true,
        options: ['Directeur', 'Chef de service', 'Superviseur', 'Comptable', 'Opérateur'].map(p => ({ value: p, label: p })) },
      { key: 'service', label: 'Service', type: 'select', required: true,
        options: ['Direction', 'Comptabilité', 'Terrain', 'Dépôt', 'Ventes'].map(s => ({ value: s, label: s })) },
      { key: 'date_embauche', label: 'Date d\'embauche', type: 'date', required: true },
      { key: 'mode_paiement', label: 'Mode de paiement', type: 'select', required: true,
        options: MODES.map(m => ({ value: m, label: m })) },
    ],
    initialValues: { date_embauche: d(0), mode_paiement: 'Virement bancaire' },
    rows: () => Array.from({ length: 18 }, (_, i) => ({
      id: i + 1, matricule: 'EMP-' + String(i + 1).padStart(4, '0'),
      nom_complet: PRODUCTEURS[i % PRODUCTEURS.length],
      poste: ['Directeur', 'Chef de service', 'Superviseur', 'Comptable', 'Opérateur'][i % 5],
      service: ['Direction', 'Comptabilité', 'Terrain', 'Dépôt', 'Ventes'][i % 5],
      date_embauche: d(i * 180),
      statut: ['actif', 'actif', 'actif', 'suspendu'][i % 4],
    })),
  },

  'rh/conges': {
    title: 'Congés',
    subtitle: 'Demandes et validation des congés.',
    icon: 'calendar',
    breadcrumb: ['Ressources humaines', 'Temps de travail'],
    entityLabel: 'congé',
    dialogSize: 'lg',
    columns: [
      { key: 'reference', label: 'Référence', width: 140, minWidth: 120, sortable: true },
      { key: 'employe', label: 'Employé', width: 200, minWidth: 140 },
      { key: 'type_conge', label: 'Type', width: 140, minWidth: 110 },
      { key: 'date_debut', label: 'Du', width: 120, minWidth: 100 },
      { key: 'date_fin', label: 'Au', width: 120, minWidth: 100 },
      { key: 'nombre_jours', label: 'Jours', width: 90, minWidth: 70, align: 'right' },
      { key: 'statut', label: 'Statut', width: 130, minWidth: 110,
        pill: pill({ demande: { label: 'Demandé', tone: 'wait' }, approuve: { label: 'Approuvé', tone: 'ok' }, refuse: { label: 'Refusé', tone: 'danger' }, annule: { label: 'Annulé', tone: 'off' } }) },
    ],
    fields: [
      { key: 'employe_id', label: 'Employé', type: 'select', required: true,
        options: PRODUCTEURS.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'type_conge', label: 'Type de congé', type: 'select', required: true, options: [
        { value: 'annuel', label: 'Congé annuel' },
        { value: 'maladie', label: 'Maladie' },
        { value: 'maternite', label: 'Maternité' },
        { value: 'paternite', label: 'Paternité' },
        { value: 'exceptionnel', label: 'Exceptionnel' },
      ]},
      { key: 'date_debut', label: 'Du', type: 'date', required: true },
      { key: 'date_fin', label: 'Au', type: 'date', required: true },
      { key: 'nombre_jours', label: 'Jours (demi-jours OK)', type: 'number', step: 0.5, min: 0 },
      { key: 'motif', label: 'Motif', type: 'textarea', cols: 1, placeholder: 'Raison de la demande…' },
    ],
    rows: () => Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, reference: 'CG-2026-' + String(i + 20).padStart(4, '0'),
      employe: PRODUCTEURS[i % PRODUCTEURS.length],
      type_conge: ['Annuel', 'Maladie', 'Maternité', 'Exceptionnel'][i % 4],
      date_debut: d(-i * 5),
      date_fin: d(-i * 5 + 7),
      nombre_jours: 7,
      statut: ['demande', 'approuve', 'approuve', 'refuse'][i % 4],
    })),
  },
};

/** Construit un ModulePageConfig à partir d'un schéma. */
export function configFromSchema(key: string): ModulePageConfig<any> | null {
  const s = ACTION_SCHEMAS[key];
  if (!s) return null;
  return {
    title: s.title,
    subtitle: s.subtitle,
    icon: s.icon,
    breadcrumb: s.breadcrumb,
    entityLabel: s.entityLabel,
    dialogSize: s.dialogSize,
    columns: s.columns,
    fields: s.fields,
    rows: s.rows(),
    kpis: s.kpis,
    initialValues: s.initialValues,
    detailDialog: true,
  };
}
