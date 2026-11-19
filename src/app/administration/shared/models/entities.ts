export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role_id: number;
  role_libelle: string;
  perimetre: string;
  actif: boolean;
  date_creation: string;
}

export interface Role {
  id: number;
  code: string;
  libelle: string;
  description: string;
  nb_utilisateurs: number;
  nb_permissions: number;
}

export interface Produit {
  id: number;
  code: string;
  libelle: string;
  famille: 'cajou' | 'cacao' | 'cafe' | 'karite';
  unite: string;
  actif: boolean;
}

export interface Campagne {
  id: number;
  code: string;
  libelle: string;
  produit_id: number;
  produit_libelle: string;
  date_debut: string;
  date_fin: string;
  statut: 'ouverte' | 'fermee' | 'brouillon';
}

export interface Zone {
  id: number;
  code: string;
  libelle: string;
  zone_parent_id: number | null;
  nb_producteurs: number;
  actif: boolean;
}

export interface Depot {
  id: number;
  code: string;
  libelle: string;
  ville: string;
  responsable: string;
  capacite_tonnes: number;
  actif: boolean;
}

export interface Parametre {
  id: number;
  code: string;
  libelle: string;
  valeur: string;
  unite: string;
  date_debut: string;
  description: string;
}

export interface Devise {
  id: number;
  code: string;
  libelle: string;
  symbole: string;
  nombre_decimales: number;
  taux_actuel: number;
  actif: boolean;
}

export interface Societe {
  id: number;
  raison_sociale: string;
  forme_juridique: string;
  rccm: string;
  nif: string;
  adresse: string;
  telephone: string;
  email: string;
  devise_tenue: string;
}

export interface Compteur {
  id: number;
  code: string;
  libelle: string;
  format: string;
  valeur_actuelle: number;
  reinitialisation: 'annuelle' | 'mensuelle' | 'aucune';
}

export interface JournalActivite {
  id: number;
  date: string;
  utilisateur: string;
  action: string;
  table_cible: string;
  ligne_id: number;
  ip: string;
}

export interface Connexion {
  id: number;
  date: string;
  utilisateur: string;
  telephone: string;
  succes: boolean;
  ip: string;
  appareil: string;
}

export interface DocumentEmis {
  id: number;
  numero: string;
  type: string;
  emis_le: string;
  emis_par: string;
  code_verification: string;
  taille_ko: number;
}
