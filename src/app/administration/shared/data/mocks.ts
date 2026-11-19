import {
  Campagne, Compteur, Connexion, Depot, Devise, DocumentEmis,
  JournalActivite, Parametre, Produit, Role, Societe, Utilisateur, Zone,
} from '../models/entities';

export const MOCK_UTILISATEURS: Utilisateur[] = [
  { id: 1, nom: 'SORY', prenom: 'Fatoumata', telephone: '620010101', email: 'fatoumata.sory@sorygroup.com', role_id: 1, role_libelle: 'Administrateur', perimetre: 'Global', actif: true,  date_creation: '2026-01-15' },
  { id: 2, nom: 'BAH',  prenom: 'Mamadou',   telephone: '620020202', email: 'm.bah@sorygroup.com',          role_id: 2, role_libelle: 'Gérant',         perimetre: 'Global', actif: true,  date_creation: '2026-01-20' },
  { id: 3, nom: 'DIALLO', prenom: 'Aïssata', telephone: '620030303', email: 'a.diallo@sorygroup.com',       role_id: 3, role_libelle: 'Comptable',      perimetre: 'Global', actif: true,  date_creation: '2026-02-05' },
  { id: 4, nom: 'CAMARA', prenom: 'Sékou',   telephone: '620040404', email: 's.camara@sorygroup.com',       role_id: 4, role_libelle: 'Superviseur',    perimetre: 'Zone Kolaboui', actif: true, date_creation: '2026-02-18' },
  { id: 5, nom: 'KEITA',  prenom: 'Ibrahima', telephone: '620050505', email: 'i.keita@sorygroup.com',       role_id: 5, role_libelle: 'Responsable dépôt', perimetre: 'Dépôt Kindia', actif: true, date_creation: '2026-03-01' },
  { id: 6, nom: 'TRAORÉ', prenom: 'Mariama', telephone: '620060606', email: 'm.traore@sorygroup.com',       role_id: 6, role_libelle: 'Ventes',         perimetre: 'Global', actif: false, date_creation: '2026-03-12' },
];

export const MOCK_ROLES: Role[] = [
  { id: 1, code: 'admin',        libelle: 'Administrateur',   description: 'Accès complet à toutes les applications', nb_utilisateurs: 1, nb_permissions: 170 },
  { id: 2, code: 'gerant',       libelle: 'Gérant',           description: 'Pilotage, validation et approbations',   nb_utilisateurs: 1, nb_permissions: 48 },
  { id: 3, code: 'comptable',    libelle: 'Comptable',        description: 'Avances, trésorerie, dépenses',          nb_utilisateurs: 2, nb_permissions: 55 },
  { id: 4, code: 'superviseur',  libelle: 'Superviseur',      description: 'Producteurs et pesées dans sa zone',     nb_utilisateurs: 4, nb_permissions: 22 },
  { id: 5, code: 'depot',        libelle: 'Responsable dépôt', description: 'Entrées, traitement et stock',          nb_utilisateurs: 3, nb_permissions: 18 },
  { id: 6, code: 'ventes',       libelle: 'Ventes',           description: 'Clients, lots de vente, factures',       nb_utilisateurs: 2, nb_permissions: 24 },
  { id: 7, code: 'import_export', libelle: 'Import-export',   description: "Dossiers d'export et d'import",          nb_utilisateurs: 1, nb_permissions: 15 },
  { id: 8, code: 'producteur',   libelle: 'Producteur',       description: 'Mon espace uniquement',                  nb_utilisateurs: 1420, nb_permissions: 1 },
];

export const MOCK_PRODUITS: Produit[] = [
  { id: 1, code: 'CJU', libelle: 'Cajou',  famille: 'cajou',  unite: 'kg', actif: true },
  { id: 2, code: 'CCO', libelle: 'Cacao',  famille: 'cacao',  unite: 'kg', actif: true },
  { id: 3, code: 'CAF', libelle: 'Café',   famille: 'cafe',   unite: 'kg', actif: true },
  { id: 4, code: 'KAR', libelle: 'Karité', famille: 'karite', unite: 'kg', actif: false },
];

export const MOCK_CAMPAGNES: Campagne[] = [
  { id: 1, code: 'CJU-2026', libelle: 'Cajou 2026',  produit_id: 1, produit_libelle: 'Cajou',  date_debut: '2026-01-01', date_fin: '2026-07-31', statut: 'ouverte' },
  { id: 2, code: 'CCO-2026', libelle: 'Cacao 2026',  produit_id: 2, produit_libelle: 'Cacao',  date_debut: '2026-10-01', date_fin: '2027-03-31', statut: 'brouillon' },
  { id: 3, code: 'CJU-2025', libelle: 'Cajou 2025',  produit_id: 1, produit_libelle: 'Cajou',  date_debut: '2025-01-01', date_fin: '2025-07-31', statut: 'fermee' },
  { id: 4, code: 'CAF-2026', libelle: 'Café 2026',   produit_id: 3, produit_libelle: 'Café',   date_debut: '2026-04-01', date_fin: '2026-11-30', statut: 'ouverte' },
];

export const MOCK_ZONES: Zone[] = [
  { id: 1, code: 'KOL', libelle: 'Kolaboui',     zone_parent_id: null, nb_producteurs: 420, actif: true },
  { id: 2, code: 'KIN', libelle: 'Kindia',       zone_parent_id: null, nb_producteurs: 310, actif: true },
  { id: 3, code: 'BOK', libelle: 'Boké',         zone_parent_id: null, nb_producteurs: 285, actif: true },
  { id: 4, code: 'MAM', libelle: 'Mamou',        zone_parent_id: null, nb_producteurs: 175, actif: true },
  { id: 5, code: 'LAB', libelle: 'Labé',         zone_parent_id: null, nb_producteurs: 230, actif: true },
  { id: 6, code: 'KOL-01', libelle: 'Kolaboui Centre', zone_parent_id: 1, nb_producteurs: 110, actif: true },
];

export const MOCK_DEPOTS: Depot[] = [
  { id: 1, code: 'DEP-KIN', libelle: 'Dépôt principal Kindia', ville: 'Kindia',   responsable: 'Ibrahima Keita', capacite_tonnes: 500, actif: true },
  { id: 2, code: 'DEP-BOK', libelle: 'Dépôt Boké',             ville: 'Boké',     responsable: 'Mohamed Soumah', capacite_tonnes: 350, actif: true },
  { id: 3, code: 'DEP-CKY', libelle: 'Entrepôt Conakry',       ville: 'Conakry',  responsable: 'Fatou Camara',   capacite_tonnes: 800, actif: true },
];

export const MOCK_PARAMETRES: Parametre[] = [
  { id: 1, code: 'HUMID_MAX_CAJOU',    libelle: 'Humidité max cajou à l\'achat', valeur: '14',    unite: '%',   date_debut: '2026-01-01', description: 'Seuil au-delà duquel le paiement est bloqué' },
  { id: 2, code: 'PART_PLAFOND_AVANCE', libelle: 'Part du plafond d\'avance',    valeur: '60',    unite: '%',   date_debut: '2026-01-01', description: '% de la récolte estimée × prix d\'achat' },
  { id: 3, code: 'TAUX_RETENUE',       libelle: 'Taux de retenue avance',       valeur: '15',    unite: '%',   date_debut: '2026-01-01', description: 'Retenue par pesée sur avance en cours' },
  { id: 4, code: 'DELAI_AVANCE',       libelle: 'Délai sans livraison',         valeur: '45',    unite: 'jours', date_debut: '2026-01-01', description: 'Alerte si pas de livraison dans ce délai' },
  { id: 5, code: 'SEUIL_ECART_POIDS',  libelle: 'Seuil écart de poids',         valeur: '2',     unite: '%',   date_debut: '2026-01-01', description: 'Écart bordereau vs réception' },
];

export const MOCK_DEVISES: Devise[] = [
  { id: 1, code: 'GNF', libelle: 'Franc guinéen', symbole: 'FG',  nombre_decimales: 0, taux_actuel: 1,       actif: true },
  { id: 2, code: 'USD', libelle: 'Dollar US',     symbole: '$',   nombre_decimales: 2, taux_actuel: 8700,    actif: true },
  { id: 3, code: 'EUR', libelle: 'Euro',          symbole: '€',   nombre_decimales: 2, taux_actuel: 9450,    actif: true },
];

export const MOCK_SOCIETE: Societe = {
  id: 1,
  raison_sociale: 'Sory Group SARL',
  forme_juridique: 'SARL',
  rccm: 'RCCM/CKY/2015-A-12345',
  nif: '00034-ABCDE',
  adresse: 'Km 36, route de Kindia, Conakry, Guinée',
  telephone: '+224 620 00 00 00',
  email: 'contact@sorygroup.com',
  devise_tenue: 'GNF',
};

export const MOCK_COMPTEURS: Compteur[] = [
  { id: 1, code: 'PESEE',   libelle: 'Pesées',           format: 'PE-{YYYY}-{000000}',  valeur_actuelle: 1284, reinitialisation: 'annuelle' },
  { id: 2, code: 'AVANCE',  libelle: 'Avances',          format: 'AV-{YYYY}-{000000}',  valeur_actuelle: 312,  reinitialisation: 'annuelle' },
  { id: 3, code: 'FACTURE', libelle: 'Factures',         format: 'FAC-{YYYY}-{000000}', valeur_actuelle: 85,   reinitialisation: 'annuelle' },
  { id: 4, code: 'BORDEREAU', libelle: 'Bordereaux',     format: 'BO-{YYYY}-{000000}',  valeur_actuelle: 423,  reinitialisation: 'annuelle' },
  { id: 5, code: 'LOT',     libelle: 'Lots',             format: 'LOT-{YYYY}-{00000}',  valeur_actuelle: 142,  reinitialisation: 'annuelle' },
];

export const MOCK_AUDIT: JournalActivite[] = [
  { id: 1, date: '2026-03-15 14:23', utilisateur: 'Fatoumata Sory',   action: 'VALIDATION',  table_cible: 'pesees',   ligne_id: 1283, ip: '192.168.1.42' },
  { id: 2, date: '2026-03-15 14:18', utilisateur: 'Mamadou Bah',       action: 'CREATION',   table_cible: 'avances',  ligne_id: 312,  ip: '192.168.1.15' },
  { id: 3, date: '2026-03-15 13:55', utilisateur: 'Aïssata Diallo',    action: 'MODIFICATION', table_cible: 'depenses', ligne_id: 847, ip: '192.168.1.22' },
  { id: 4, date: '2026-03-15 11:30', utilisateur: 'Sékou Camara',      action: 'CREATION',   table_cible: 'pesees',   ligne_id: 1282, ip: '41.87.21.14' },
  { id: 5, date: '2026-03-15 10:12', utilisateur: 'Ibrahima Keita',    action: 'RECEPTION',  table_cible: 'entrees_depot', ligne_id: 95, ip: '192.168.1.78' },
];

export const MOCK_CONNEXIONS: Connexion[] = [
  { id: 1, date: '2026-03-15 08:30', utilisateur: 'Fatoumata Sory', telephone: '620010101', succes: true,  ip: '192.168.1.42', appareil: 'Chrome / Mac' },
  { id: 2, date: '2026-03-15 08:45', utilisateur: 'Mamadou Bah',    telephone: '620020202', succes: true,  ip: '192.168.1.15', appareil: 'Safari / iPhone' },
  { id: 3, date: '2026-03-15 09:12', utilisateur: 'Aïssata Diallo', telephone: '620030303', succes: false, ip: '192.168.1.22', appareil: 'Chrome / Windows' },
  { id: 4, date: '2026-03-15 09:14', utilisateur: 'Aïssata Diallo', telephone: '620030303', succes: true,  ip: '192.168.1.22', appareil: 'Chrome / Windows' },
];

export const MOCK_DOCUMENTS: DocumentEmis[] = [
  { id: 1, numero: 'PE-2026-001283', type: 'Reçu de pesée', emis_le: '2026-03-15 14:24', emis_par: 'Fatoumata Sory', code_verification: 'A7F3-K2L9', taille_ko: 128 },
  { id: 2, numero: 'FAC-2026-000084', type: 'Facture',     emis_le: '2026-03-14 16:02', emis_par: 'Mariama Traoré',  code_verification: 'B8G4-M3N0', taille_ko: 215 },
  { id: 3, numero: 'AV-2026-000311',  type: 'Reçu d\'avance', emis_le: '2026-03-14 11:30', emis_par: 'Aïssata Diallo', code_verification: 'C9H5-P4Q1', taille_ko: 97 },
];
