import { FormField } from '../../../administration/shared/dialogs/entity-form/entity-form.types';
import { DataTableColumn } from '../data-table/data-table.component';

export interface EntitySchema {
  columns: DataTableColumn<any>[];
  fields: FormField[];
  mock: () => any[];
  initialValues?: Record<string, any>;
  kpis?: Array<{ label: string; value: string; note?: string; tone?: 'ok' | 'wait' | 'info' | 'danger' | 'neutral' }>;
}

// Helpers
const pill = (map: Record<string, { label: string; tone: any }>) =>
  (r: any) => map[r.statut] ?? { label: r.statut, tone: 'neutral' };
const date = (d = 0) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
const money = (n: number) => n.toLocaleString('fr-FR') + ' GNF';
const weight = (n: number) => (n / 1000).toFixed(3).replace('.', ',') + ' kg';
const pct = (n: number) => n.toFixed(1).replace('.', ',') + ' %';

const STATUTS_PESEE = { saisie: { label: 'Saisie', tone: 'neutral' }, validee: { label: 'À payer', tone: 'wait' }, payee: { label: 'Payée', tone: 'ok' }, remplacee: { label: 'Remplacée', tone: 'off' }, annulee: { label: 'Annulée', tone: 'off' } };
const STATUTS_AVANCE = { proposee: { label: 'À valider', tone: 'wait' }, validee: { label: 'À verser', tone: 'wait' }, versee: { label: 'Versée', tone: 'info' }, soldee: { label: 'Soldée', tone: 'ok' }, en_retard: { label: 'En retard', tone: 'danger' }, refusee: { label: 'Refusée', tone: 'danger' }, annulee: { label: 'Annulée', tone: 'off' } };
const STATUTS_LOT = { en_traitement: { label: 'En traitement', tone: 'info' }, pret_a_vendre: { label: 'Prêt à vendre', tone: 'ok' }, bloque: { label: 'Bloqué', tone: 'danger' }, vendu: { label: 'Vendu', tone: 'neutral' } };
const STATUTS_FACTURE = { brouillon: { label: 'Brouillon', tone: 'neutral' }, emise: { label: 'À encaisser', tone: 'wait' }, payee_partiel: { label: 'Partielle', tone: 'wait' }, payee: { label: 'Payée', tone: 'ok' }, annulee: { label: 'Annulée', tone: 'off' } };
const STATUTS_VISITE = { prevue: { label: 'Prévue', tone: 'info' }, effectuee: { label: 'Effectuée', tone: 'ok' }, reportee: { label: 'Reportée', tone: 'wait' } };
const STATUTS_CONTRAT = { brouillon: { label: 'Brouillon', tone: 'neutral' }, actif: { label: 'Actif', tone: 'ok' }, termine: { label: 'Terminé', tone: 'info' }, rompu: { label: 'Rompu', tone: 'danger' } };

const PRODUITS = ['Cajou', 'Cacao', 'Café', 'Karité'];
const ZONES = ['Kolaboui', 'Kindia', 'Boké', 'Mamou', 'Labé'];
const VILLAGES = ['Kolaboui centre', 'Kataco', 'Sangaredi', 'Télémélé', 'Dalaba', 'Koba'];
const PROD_NOMS = ['Mamadou Bah', 'Aïssata Diallo', 'Sékou Camara', 'Fatoumata Sow', 'Ibrahima Keita', 'Mariama Traoré', 'Alpha Barry', 'Kadiatou Sylla'];

export const SCHEMAS: Record<string, EntitySchema> = {

  // ---------------- TERRAIN ----------------
  producteurs: {
    columns: [
      { key: 'code', label: 'Code', width: 110, minWidth: 90, sortable: true },
      { key: 'nom_complet', label: 'Nom complet', width: 200, minWidth: 140, sortable: true },
      { key: 'telephone', label: 'Téléphone', width: 130, minWidth: 110 },
      { key: 'zone', label: 'Zone', width: 130, minWidth: 100, sortable: true, hideOnMobile: true },
      { key: 'village', label: 'Village', width: 150, minWidth: 110, hideOnMobile: true },
      { key: 'nb_champs', label: 'Champs', width: 90, minWidth: 70, align: 'right' },
      { key: 'date_adhesion', label: 'Adhésion', width: 120, minWidth: 100, sortable: true, hideOnMobile: true },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'ex. BAH' },
      { key: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'ex. Mamadou' },
      { key: 'telephone', label: 'Téléphone', type: 'tel', required: true, placeholder: '620 00 00 00' },
      { key: 'date_naissance', label: 'Date de naissance', type: 'date' },
      { key: 'zone', label: 'Zone', type: 'select', required: true, options: ZONES.map(z => ({ value: z, label: z })) },
      { key: 'village', label: 'Village', type: 'text', placeholder: 'ex. Kolaboui centre' },
      { key: 'piece_identite', label: 'Pièce d\'identité', type: 'text', placeholder: 'N° CNI ou passeport' },
      { key: 'notes', label: 'Notes', type: 'textarea', cols: 1, placeholder: 'Observations libres sur le producteur…' },
    ],
    mock: () => Array.from({ length: 24 }, (_, i) => ({
      id: i + 1, code: 'PR-' + String(i + 1).padStart(4, '0'),
      nom_complet: PROD_NOMS[i % PROD_NOMS.length],
      telephone: '62' + (1000000 + i * 123).toString().slice(0, 7),
      zone: ZONES[i % ZONES.length],
      village: VILLAGES[i % VILLAGES.length],
      nb_champs: (i % 4) + 1,
      date_adhesion: date(i * 30),
    })),
    kpis: [
      { label: 'Producteurs actifs', value: '1 487', note: 'sur 1 500+', tone: 'ok' },
      { label: 'Nouveaux (30j)', value: '42', tone: 'info' },
      { label: 'Zones couvertes', value: '12', tone: 'neutral' },
      { label: 'Villages', value: '68', tone: 'neutral' },
    ],
  },

  champs: {
    columns: [
      { key: 'code', label: 'Code', width: 110, minWidth: 90, sortable: true },
      { key: 'producteur', label: 'Producteur', width: 200, minWidth: 140, sortable: true },
      { key: 'produit', label: 'Produit', width: 110, minWidth: 90 },
      { key: 'surface', label: 'Surface', width: 120, minWidth: 100, align: 'right', format: (r: any) => r.surface.toFixed(1).replace('.', ',') + ' ha' },
      { key: 'estimation', label: 'Estimation', width: 140, minWidth: 110, align: 'right', format: (r: any) => (r.estimation).toLocaleString('fr-FR') + ' kg' },
      { key: 'village', label: 'Village', width: 150, minWidth: 110, hideOnMobile: true },
    ],
    fields: [
      { key: 'producteur_id', label: 'Producteur', type: 'select', required: true, placeholder: 'Sélectionner un producteur',
        options: PROD_NOMS.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'produit', label: 'Produit', type: 'select', required: true,
        options: PRODUITS.map(p => ({ value: p, label: p })) },
      { key: 'surface', label: 'Surface', type: 'number', required: true, unite: 'ha', step: 0.1, min: 0, placeholder: '0,0' },
      { key: 'estimation_kg', label: 'Estimation récolte', type: 'number', unite: 'kg', min: 0, placeholder: '0' },
      { key: 'village', label: 'Village', type: 'text', placeholder: 'ex. Kataco' },
      { key: 'latitude', label: 'Latitude GPS', type: 'number', step: 0.000001, placeholder: 'ex. 10.746292' },
      { key: 'longitude', label: 'Longitude GPS', type: 'number', step: 0.000001, placeholder: 'ex. -14.283654' },
      { key: 'notes', label: 'Notes', type: 'textarea', cols: 1, placeholder: 'Topographie, accessibilité, remarques…' },
    ],
    mock: () => Array.from({ length: 20 }, (_, i) => ({
      id: i + 1, code: 'CH-' + String(i + 1).padStart(4, '0'),
      producteur: PROD_NOMS[i % PROD_NOMS.length],
      produit: PRODUITS[i % PRODUITS.length],
      surface: (Math.random() * 6 + 0.5),
      estimation: Math.round((Math.random() * 1500 + 200)),
      village: VILLAGES[i % VILLAGES.length],
    })),
  },

  visites: {
    columns: [
      { key: 'date', label: 'Date', width: 120, minWidth: 100, sortable: true },
      { key: 'producteur', label: 'Producteur', width: 200, minWidth: 140 },
      { key: 'champ', label: 'Champ', width: 130, minWidth: 100 },
      { key: 'type', label: 'Type', width: 140, minWidth: 110 },
      { key: 'statut', label: 'Statut', width: 130, minWidth: 110, pill: pill(STATUTS_VISITE) },
      { key: 'superviseur', label: 'Superviseur', width: 160, minWidth: 120, hideOnMobile: true },
    ],
    fields: [
      { key: 'date', label: 'Date de visite', type: 'date', required: true },
      { key: 'producteur_id', label: 'Producteur', type: 'select', required: true,
        options: PROD_NOMS.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'champ_id', label: 'Champ', type: 'select', options: [{ value: 1, label: 'CH-0001' }, { value: 2, label: 'CH-0002' }] },
      { key: 'type', label: 'Type', type: 'select', required: true, options: [
        { value: 'prospection', label: 'Prospection' },
        { value: 'conseil', label: 'Conseil technique' },
        { value: 'controle', label: 'Contrôle qualité' },
        { value: 'suivi', label: 'Suivi récolte' },
      ]},
      { key: 'observations', label: 'Observations', type: 'textarea', cols: 1, required: true, placeholder: 'État de la parcelle, conseils donnés, anomalies constatées…' },
    ],
    mock: () => Array.from({ length: 15 }, (_, i) => ({
      id: i + 1, date: date(i * 2),
      producteur: PROD_NOMS[i % PROD_NOMS.length],
      champ: 'CH-' + String((i % 20) + 1).padStart(4, '0'),
      type: ['Prospection', 'Conseil', 'Contrôle', 'Suivi'][i % 4],
      statut: ['prevue', 'effectuee', 'effectuee', 'reportee'][i % 4],
      superviseur: PROD_NOMS[(i + 3) % PROD_NOMS.length],
    })),
  },

  pesees: {
    columns: [
      { key: 'numero', label: 'N°', width: 150, minWidth: 120, sortable: true },
      { key: 'date_pesee', label: 'Date', width: 120, minWidth: 100, sortable: true },
      { key: 'producteur', label: 'Producteur', width: 180, minWidth: 140 },
      { key: 'produit', label: 'Produit', width: 100, minWidth: 80 },
      { key: 'poids_net_kg', label: 'Net', width: 110, minWidth: 90, align: 'right', format: (r: any) => weight(r.poids_net_g) },
      { key: 'humidite_pct', label: 'Humidité', width: 110, minWidth: 90, align: 'right', format: (r: any) => pct(r.humidite_pct) },
      { key: 'prix_kg', label: 'Prix/kg', width: 130, minWidth: 110, align: 'right', hideOnMobile: true, format: (r: any) => r.prix_kg.toLocaleString('fr-FR') + ' GNF' },
      { key: 'net_a_payer', label: 'Net à payer', width: 160, minWidth: 130, align: 'right', format: (r: any) => money(r.net_a_payer) },
      { key: 'statut', label: 'Statut', width: 120, minWidth: 100, pill: pill(STATUTS_PESEE) },
    ],
    fields: [
      { key: 'date_pesee', label: 'Date de pesée', type: 'date', required: true },
      { key: 'producteur_id', label: 'Producteur', type: 'select', required: true,
        options: PROD_NOMS.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'produit', label: 'Produit', type: 'select', required: true, options: PRODUITS.map(p => ({ value: p, label: p })) },
      { key: 'nombre_sacs', label: 'Nombre de sacs', type: 'number', required: true, min: 1, placeholder: '0' },
      { key: 'poids_brut_kg', label: 'Poids brut', type: 'number', required: true, unite: 'kg', step: 0.001, min: 0, placeholder: '0,000' },
      { key: 'tare_kg', label: 'Tare', type: 'number', unite: 'kg', step: 0.001, min: 0, placeholder: '0,000' },
      { key: 'humidite_pct', label: 'Humidité', type: 'number', required: true, unite: '%', step: 0.1, min: 0, max: 100, placeholder: '14,0' },
      { key: 'prix_kg', label: 'Prix au kg', type: 'number', unite: 'GNF/kg', min: 0, placeholder: '0', hint: 'Si laissé vide, le prix du jour s\'applique' },
    ],
    mock: () => Array.from({ length: 20 }, (_, i) => {
      const p = Math.round((Math.random() * 400 + 50) * 1000);
      const h = Math.random() * 6 + 10;
      const pr = [5500, 6000, 7200, 8500][i % 4];
      return {
        id: i + 1, numero: 'PE-2026-' + String(i + 1200).padStart(6, '0'),
        date_pesee: date(i), producteur: PROD_NOMS[i % PROD_NOMS.length],
        produit: PRODUITS[i % PRODUITS.length], nombre_sacs: Math.floor(p / 80000) + 1,
        poids_net_g: p, humidite_pct: h, prix_kg: pr,
        net_a_payer: Math.round((p * pr * 0.85) / 1000),
        statut: ['validee', 'payee', 'saisie', 'validee', 'payee'][i % 5],
      };
    }),
    kpis: [
      { label: 'Pesées (semaine)', value: '284', note: '+12% vs sem-1', tone: 'info' },
      { label: 'Tonnage net', value: '42,8 t', note: 'cajou', tone: 'ok' },
      { label: 'À payer', value: '18', note: 'validées', tone: 'wait' },
      { label: 'Bloquées humidité', value: '3', tone: 'danger' },
    ],
  },

  bordereaux: {
    columns: [
      { key: 'numero', label: 'N°', width: 150, minWidth: 120, sortable: true },
      { key: 'date_envoi', label: 'Date envoi', width: 120, minWidth: 100, sortable: true },
      { key: 'depot', label: 'Dépôt', width: 150, minWidth: 110 },
      { key: 'nb_sacs', label: 'Sacs', width: 80, minWidth: 60, align: 'right' },
      { key: 'poids_total', label: 'Poids', width: 130, minWidth: 100, align: 'right', format: (r: any) => weight(r.poids_g) },
      { key: 'transporteur', label: 'Transporteur', width: 160, minWidth: 120, hideOnMobile: true },
      { key: 'statut', label: 'Statut', width: 140, minWidth: 110, pill: (r: any) => ({ prepare: { label: 'Préparé', tone: 'neutral' }, envoye: { label: 'Envoyé', tone: 'info' }, recu: { label: 'Reçu', tone: 'ok' } }[r.statut as string] ?? { label: r.statut, tone: 'neutral' }) },
    ],
    fields: [
      { key: 'date_envoi', label: 'Date d\'envoi', type: 'date', required: true },
      { key: 'depot_id', label: 'Dépôt destinataire', type: 'select', required: true, options: [
        { value: 1, label: 'Dépôt principal Kindia' },
        { value: 2, label: 'Dépôt Boké' },
        { value: 3, label: 'Entrepôt Conakry' },
      ]},
      { key: 'transporteur', label: 'Transporteur', type: 'text', required: true, placeholder: 'ex. Sylla Transport' },
      { key: 'immatriculation', label: 'Immatriculation', type: 'text', placeholder: 'ex. RCJ-1234 AB' },
      { key: 'nb_sacs', label: 'Nombre de sacs', type: 'number', required: true, min: 1 },
      { key: 'cout_transport', label: 'Coût transport', type: 'number', unite: 'GNF', min: 0 },
      { key: 'notes', label: 'Notes', type: 'textarea', cols: 1, placeholder: 'Observations sur le chargement, la livraison…' },
    ],
    mock: () => Array.from({ length: 15 }, (_, i) => ({
      id: i + 1, numero: 'BO-2026-' + String(i + 100).padStart(6, '0'),
      date_envoi: date(i),
      depot: ['Kindia', 'Boké', 'Conakry'][i % 3] + ' — ' + ['principal', 'nord', 'export'][i % 3],
      nb_sacs: Math.floor(Math.random() * 100 + 20),
      poids_g: Math.round(Math.random() * 3_000_000 + 500_000),
      transporteur: ['Sylla Transport', 'Camara SA', 'Bah Logistic'][i % 3],
      statut: ['prepare', 'envoye', 'recu', 'recu'][i % 4],
    })),
  },

  // ---------------- DEPOTS ----------------
  lots: {
    columns: [
      { key: 'code', label: 'Code', width: 140, minWidth: 120, sortable: true },
      { key: 'produit', label: 'Produit', width: 110, minWidth: 90 },
      { key: 'poids_entree', label: 'Entrée', width: 130, minWidth: 110, align: 'right', format: (r: any) => weight(r.poids_entree_g) },
      { key: 'poids_actuel', label: 'Actuel', width: 130, minWidth: 110, align: 'right', format: (r: any) => weight(r.poids_actuel_g) },
      { key: 'perte_pct', label: 'Perte', width: 100, minWidth: 80, align: 'right', format: (r: any) => pct(r.perte_pct) },
      { key: 'depot', label: 'Dépôt', width: 150, minWidth: 110, hideOnMobile: true },
      { key: 'statut', label: 'Statut', width: 150, minWidth: 130, pill: pill(STATUTS_LOT) },
    ],
    fields: [
      { key: 'produit', label: 'Produit', type: 'select', required: true, options: PRODUITS.map(p => ({ value: p, label: p })) },
      { key: 'depot_id', label: 'Dépôt', type: 'select', required: true, options: [
        { value: 1, label: 'Dépôt principal Kindia' },
        { value: 2, label: 'Dépôt Boké' },
      ]},
      { key: 'poids_entree_kg', label: 'Poids d\'entrée', type: 'number', required: true, unite: 'kg', step: 0.001, min: 0 },
      { key: 'humidite_entree', label: 'Humidité entrée', type: 'number', unite: '%', step: 0.1, placeholder: '14,0' },
      { key: 'date_entree', label: 'Date d\'entrée', type: 'date', required: true },
      { key: 'notes', label: 'Observations', type: 'textarea', cols: 1, placeholder: 'Composition du lot, apports, remarques…' },
    ],
    mock: () => Array.from({ length: 18 }, (_, i) => {
      const e = Math.round(Math.random() * 10_000_000 + 2_000_000);
      const a = Math.round(e * (0.88 + Math.random() * 0.1));
      return {
        id: i + 1, code: 'LOT-2026-' + String(i + 10).padStart(5, '0'),
        produit: PRODUITS[i % PRODUITS.length],
        poids_entree_g: e, poids_actuel_g: a,
        perte_pct: ((e - a) / e) * 100,
        depot: ['Kindia', 'Boké', 'Conakry'][i % 3],
        statut: ['en_traitement', 'pret_a_vendre', 'vendu', 'bloque'][i % 4],
      };
    }),
  },

  // ---------------- VENTES ----------------
  clients: {
    columns: [
      { key: 'code', label: 'Code', width: 110, minWidth: 90, sortable: true },
      { key: 'raison_sociale', label: 'Raison sociale', width: 240, minWidth: 180, sortable: true },
      { key: 'pays', label: 'Pays', width: 130, minWidth: 100 },
      { key: 'contact', label: 'Contact', width: 180, minWidth: 140, hideOnMobile: true },
      { key: 'encours', label: 'Encours', width: 150, minWidth: 110, align: 'right', format: (r: any) => money(r.encours) },
    ],
    fields: [
      { key: 'raison_sociale', label: 'Raison sociale', type: 'text', required: true, placeholder: 'ex. Olam International', cols: 1 },
      { key: 'pays', label: 'Pays', type: 'select', required: true, options: [
        { value: 'IN', label: 'Inde' }, { value: 'VN', label: 'Vietnam' }, { value: 'NL', label: 'Pays-Bas' },
        { value: 'DE', label: 'Allemagne' }, { value: 'US', label: 'États-Unis' }, { value: 'CN', label: 'Chine' },
      ]},
      { key: 'contact_nom', label: 'Nom du contact', type: 'text', placeholder: 'ex. John Smith' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'contact@societe.com' },
      { key: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '+XX XX XX XX XX XX' },
      { key: 'devise', label: 'Devise', type: 'select', options: [
        { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GNF', label: 'GNF' },
      ]},
      { key: 'delai_paiement', label: 'Délai de paiement', type: 'number', unite: 'jours', min: 0 },
      { key: 'notes', label: 'Notes', type: 'textarea', cols: 1, placeholder: 'Historique commercial, préférences, contact habituel…' },
    ],
    mock: () => Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, code: 'CL-' + String(i + 1).padStart(4, '0'),
      raison_sociale: ['Olam International', 'Cargill SA', 'Vietnam Cashew Co.', 'Barry Callebaut', 'Nestlé', 'Blommer Chocolate', 'Sucden', 'Sucafina', 'Noble Group', 'ETG Agri', 'Louis Dreyfus', 'ADM'][i],
      pays: ['Inde', 'Pays-Bas', 'Vietnam', 'Suisse', 'Suisse', 'USA', 'France', 'Suisse', 'Hong Kong', 'Kenya', 'Pays-Bas', 'USA'][i],
      contact: ['R. Kumar', 'J. Van Dijk', 'T. Nguyen', 'B. Weber', 'M. Dupont', 'K. Johnson', 'P. Dubois', 'S. Rossi', 'L. Chen', 'N. Mwangi', 'A. Jansen', 'C. Miller'][i],
      encours: Math.round(Math.random() * 500_000_000 + 10_000_000),
    })),
  },

  factures: {
    columns: [
      { key: 'numero', label: 'N°', width: 150, minWidth: 130, sortable: true },
      { key: 'date_emission', label: 'Émise le', width: 120, minWidth: 100, sortable: true },
      { key: 'client', label: 'Client', width: 220, minWidth: 160 },
      { key: 'montant_ht', label: 'Montant HT', width: 150, minWidth: 120, align: 'right', format: (r: any) => r.montant_ht.toLocaleString('fr-FR') + ' ' + r.devise },
      { key: 'echeance', label: 'Échéance', width: 120, minWidth: 100, hideOnMobile: true },
      { key: 'statut', label: 'Statut', width: 140, minWidth: 120, pill: pill(STATUTS_FACTURE) },
    ],
    fields: [
      { key: 'client_id', label: 'Client', type: 'select', required: true, placeholder: 'Sélectionner un client',
        options: Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `CL-${String(i + 1).padStart(4, '0')}` })) },
      { key: 'lot_vente_id', label: 'Lot de vente', type: 'select', placeholder: 'Sélectionner le lot vendu', options: [
        { value: 1, label: 'LV-2026-001' }, { value: 2, label: 'LV-2026-002' },
      ]},
      { key: 'date_emission', label: 'Date d\'émission', type: 'date', required: true },
      { key: 'echeance', label: 'Échéance', type: 'date', required: true },
      { key: 'montant_ht', label: 'Montant HT', type: 'number', required: true, min: 0, placeholder: '0' },
      { key: 'devise', label: 'Devise', type: 'select', required: true, options: [
        { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'GNF', label: 'GNF' },
      ]},
      { key: 'taux_change', label: 'Taux du jour', type: 'number', step: 0.0001, placeholder: 'ex. 8700' },
      { key: 'conditions', label: 'Conditions', type: 'textarea', cols: 1, placeholder: 'Incoterms, lieu de livraison, pénalités…' },
    ],
    mock: () => Array.from({ length: 15 }, (_, i) => ({
      id: i + 1, numero: 'FAC-2026-' + String(i + 50).padStart(6, '0'),
      date_emission: date(i * 5),
      client: ['Olam', 'Cargill', 'Vietnam Cashew', 'Barry Callebaut', 'Nestlé'][i % 5],
      montant_ht: Math.round(Math.random() * 500_000 + 50_000),
      devise: ['USD', 'EUR', 'USD'][i % 3],
      echeance: date(i * 5 - 30),
      statut: ['brouillon', 'emise', 'payee_partiel', 'payee', 'emise'][i % 5],
    })),
  },

  // ---------------- COMPTABILITÉ ----------------
  avances: {
    columns: [
      { key: 'numero', label: 'N°', width: 140, minWidth: 120, sortable: true },
      { key: 'date_demande', label: 'Date', width: 120, minWidth: 100, sortable: true },
      { key: 'producteur', label: 'Producteur', width: 200, minWidth: 140 },
      { key: 'montant', label: 'Montant', width: 160, minWidth: 130, align: 'right', format: (r: any) => money(r.montant) },
      { key: 'motif', label: 'Motif', width: 180, minWidth: 140, hideOnMobile: true },
      { key: 'statut', label: 'Statut', width: 150, minWidth: 130, pill: pill(STATUTS_AVANCE) },
    ],
    fields: [
      { key: 'producteur_id', label: 'Producteur', type: 'select', required: true, placeholder: 'Sélectionner un producteur',
        options: PROD_NOMS.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'montant', label: 'Montant demandé', type: 'number', required: true, unite: 'GNF', min: 0, placeholder: '0', hint: 'Plafond calculé automatiquement selon la récolte estimée' },
      { key: 'date_demande', label: 'Date de demande', type: 'date', required: true },
      { key: 'motif', label: 'Motif', type: 'select', required: true, options: [
        { value: 'preparation_champ', label: 'Préparation du champ' },
        { value: 'main_oeuvre', label: 'Main d\'œuvre' },
        { value: 'intrants', label: 'Intrants (engrais, phytosanitaires)' },
        { value: 'materiel', label: 'Matériel agricole' },
        { value: 'besoin_personnel', label: 'Besoin personnel' },
        { value: 'autre', label: 'Autre' },
      ]},
      { key: 'taux_retenue', label: 'Taux de retenue', type: 'number', unite: '%', step: 0.1, placeholder: '15,0' },
      { key: 'objectif_livraison', label: 'Livraison attendue avant', type: 'date' },
      { key: 'notes', label: 'Détails du besoin', type: 'textarea', cols: 1, required: true, placeholder: 'Décrivez précisément à quoi servira l\'avance.' },
    ],
    mock: () => Array.from({ length: 15 }, (_, i) => ({
      id: i + 1, numero: 'AV-2026-' + String(i + 100).padStart(6, '0'),
      date_demande: date(i * 3),
      producteur: PROD_NOMS[i % PROD_NOMS.length],
      montant: [250000, 500000, 750000, 1000000, 1500000, 2000000][i % 6],
      motif: ['Préparation champ', 'Main d\'œuvre', 'Intrants', 'Matériel', 'Besoin personnel'][i % 5],
      statut: ['proposee', 'validee', 'versee', 'soldee', 'en_retard', 'refusee'][i % 6],
    })),
    kpis: [
      { label: 'À valider', value: '12', note: 'demandes en attente', tone: 'wait' },
      { label: 'À verser', value: '8', note: 'validées', tone: 'wait' },
      { label: 'En retard', value: '3', note: 'sans livraison', tone: 'danger' },
      { label: 'Encours total', value: '142 M', note: 'GNF', tone: 'info' },
    ],
  },

  // ---------------- RH ----------------
  employes: {
    columns: [
      { key: 'matricule', label: 'Matricule', width: 110, minWidth: 90, sortable: true },
      { key: 'nom_complet', label: 'Nom complet', width: 200, minWidth: 140, sortable: true },
      { key: 'poste', label: 'Poste', width: 180, minWidth: 140, hideOnMobile: true },
      { key: 'service', label: 'Service', width: 150, minWidth: 110, hideOnMobile: true },
      { key: 'date_embauche', label: 'Embauche', width: 120, minWidth: 100 },
      { key: 'salaire_base', label: 'Salaire base', width: 150, minWidth: 110, align: 'right', format: (r: any) => money(r.salaire_base) },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'ex. CAMARA' },
      { key: 'prenom', label: 'Prénom', type: 'text', required: true, placeholder: 'ex. Sékou' },
      { key: 'date_naissance', label: 'Date de naissance', type: 'date' },
      { key: 'telephone', label: 'Téléphone', type: 'tel', required: true, placeholder: '620 00 00 00' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'prenom.nom@sorygroup.com' },
      { key: 'service_id', label: 'Service', type: 'select', required: true, options: [
        { value: 1, label: 'Direction' }, { value: 2, label: 'Comptabilité' },
        { value: 3, label: 'Terrain' }, { value: 4, label: 'Dépôt' }, { value: 5, label: 'Ventes' },
      ]},
      { key: 'poste_id', label: 'Poste', type: 'select', required: true, options: [
        { value: 1, label: 'Directeur' }, { value: 2, label: 'Chef de service' },
        { value: 3, label: 'Superviseur' }, { value: 4, label: 'Comptable' }, { value: 5, label: 'Opérateur' },
      ]},
      { key: 'date_embauche', label: 'Date d\'embauche', type: 'date', required: true },
      { key: 'salaire_base', label: 'Salaire de base', type: 'number', unite: 'GNF', required: true, min: 0 },
      { key: 'adresse', label: 'Adresse', type: 'textarea', cols: 1, placeholder: 'Adresse de résidence…' },
    ],
    mock: () => Array.from({ length: 18 }, (_, i) => ({
      id: i + 1, matricule: 'EMP-' + String(i + 1).padStart(4, '0'),
      nom_complet: PROD_NOMS[i % PROD_NOMS.length],
      poste: ['Directeur', 'Chef de service', 'Superviseur', 'Comptable', 'Opérateur'][i % 5],
      service: ['Direction', 'Comptabilité', 'Terrain', 'Dépôt', 'Ventes'][i % 5],
      date_embauche: date(i * 180),
      salaire_base: [8_000_000, 5_500_000, 3_500_000, 4_200_000, 2_800_000][i % 5],
    })),
  },
};

export const schemaByEntity = (key: string): EntitySchema | null => SCHEMAS[key] ?? null;
