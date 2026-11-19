import { environment } from '../environments/environment';

export const APP_NAME = 'Sory Group';
export const APP_TAGLINE = 'Chaîne agricole';

/** URLs API : la variable BASE_URL est l'URL active (selon l'environnement).
 * Les services métier des modules s'appuient sur BASE_URL directement. */
export const API_URL_LOCAL = environment.apiUrlLocal;
export const API_URL_PROD  = environment.apiUrlProd;
export const BASE_URL      = environment.apiUrl || (environment.production ? API_URL_PROD : '');
export const IS_PRODUCTION = environment.production;
export const USE_MOCKS     = environment.useMocks;

export type ModuleId =
  | 'pilotage' | 'terrain' | 'depots' | 'ventes' | 'comptabilite'
  | 'rh' | 'administration' | 'mon-espace';

export type Permission = `${ModuleId}.${string}`;

export type ModuleStatus = 'open' | 'soon';

export interface ModuleDef {
  id: ModuleId;
  order: number;
  label: string;
  description: string;
  icon: string;
  path: string;
  prefix: string;
  status: ModuleStatus;
  /** Teinte utilisée sur la tuile du portail */
  accent?: 'green' | 'blue' | 'ochre' | 'indigo' | 'teal' | 'coral' | 'violet' | 'grey';
}

export const MODULES: readonly ModuleDef[] = [
  { id: 'pilotage',       order: 1, label: 'Pilotage',                 description: 'Tableaux de bord, alertes, approbations',
    icon: 'layout-dashboard', path: '/pilotage',       prefix: 'pi', status: 'open', accent: 'green' },
  { id: 'terrain',        order: 2, label: 'Producteurs et collecte',  description: 'Producteurs, champs, visites, pesées, envois au dépôt',
    icon: 'sprout',           path: '/terrain',        prefix: 'te', status: 'open', accent: 'teal' },
  { id: 'depots',         order: 3, label: 'Dépôts et traitement',     description: 'Entrées, lots, séchage et tri, stock, inventaires',
    icon: 'warehouse',        path: '/depots',         prefix: 'de', status: 'open', accent: 'ochre' },
  { id: 'ventes',         order: 4, label: 'Ventes et import-export',  description: "Clients, lots de vente, factures, marges, dossiers d'export",
    icon: 'handshake',        path: '/ventes',         prefix: 've', status: 'open', accent: 'indigo' },
  { id: 'comptabilite',   order: 5, label: 'Comptabilité',             description: 'Avances, trésorerie, dépenses, résultat de campagne',
    icon: 'landmark',         path: '/comptabilite',   prefix: 'co', status: 'open', accent: 'blue' },
  { id: 'rh',             order: 6, label: 'Ressources humaines',      description: 'Employés, contrats, présences, paie',
    icon: 'briefcase',        path: '/rh',             prefix: 'rh', status: 'open', accent: 'violet' },
  { id: 'administration', order: 7, label: 'Administration',           description: "Utilisateurs, produits, zones, seuils, journal d'audit",
    icon: 'settings',         path: '/administration', prefix: 'ad', status: 'open', accent: 'grey' },
  { id: 'mon-espace',     order: 8, label: 'Mon espace',               description: 'Mon compte, mes livraisons, mes paiements',
    icon: 'user',             path: '/mon-espace',     prefix: 'me', status: 'open', accent: 'coral' },
];

export const moduleById = (id: ModuleId): ModuleDef => MODULES.find(m => m.id === id)!;

export const APP_PATHS = {
  auth: '/auth',
  motDePasse: '/auth/mot-de-passe',
  portail: '/portail',
  notfound: '/notfound',
} as const;

export const API_PATHS = {
  login: 'auth/login',
  logout: 'auth/logout',
  me: 'auth/me',
  motDePasse: 'auth/mot-de-passe',
  contexte: 'contexte',
  compteurs: 'menus/compteurs',
  piecesJointes: 'pieces-jointes',
  historique: 'historique',
  documents: 'documents',
} as const;

export const STORAGE_KEYS = {
  token: 'sg_token',
  user: 'sg_user',
  lastModule: 'sg_last_module',
  sidebar: 'sg_sidebar',
  campagne: 'sg_campagne',
  theme: 'sg_theme',
} as const;

export const DEVISE_TENUE = 'GNF';
