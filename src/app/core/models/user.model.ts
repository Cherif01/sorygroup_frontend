import { Permission } from '../../config';

export interface Perimetre {
  zone_ids: number[];
  depot_ids: number[];
}

export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  initiales: string;
  telephone: string;
  email?: string;
  role: { code: string; libelle: string };
  permissions: Permission[];
  perimetre: Perimetre;
  producteur_id: number | null;
  est_mot_de_passe_provisoire: boolean;
  avatar_url?: string | null;
}
