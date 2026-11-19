import { ModuleMenuConfig } from '../core/models/menu.model';

export const ADMINISTRATION_MENU: ModuleMenuConfig = {
  module: 'administration',
  sections: [
    { id: 'acces', title: 'Accès', items: [
      { id: 'utilisateurs', label: 'Utilisateurs',   icon: 'users',     route: '/administration/utilisateurs', permission: 'administration.utilisateur.voir' },
      { id: 'roles',        label: 'Rôles et droits', icon: 'key-round', route: '/administration/roles',        permission: 'administration.role.voir' },
    ]},
    { id: 'referentiels', title: 'Référentiels', items: [
      { id: 'produits',   label: 'Produits et règles', icon: 'sprout',    route: '/administration/produits',   permission: 'administration.produit.voir' },
      { id: 'campagnes',  label: 'Campagnes',          icon: 'calendar',  route: '/administration/campagnes',  permission: 'administration.campagne.voir' },
      { id: 'zones',      label: 'Zones',              icon: 'list-tree', route: '/administration/zones',      permission: 'administration.zone.voir' },
      { id: 'depots',     label: 'Dépôts',             icon: 'warehouse', route: '/administration/depots',     permission: 'administration.depot.voir' },
    ]},
    { id: 'reglages', title: 'Réglages', items: [
      { id: 'parametres',   label: 'Paramètres et seuils', icon: 'sliders',    route: '/administration/parametres',   permission: 'administration.parametre.voir' },
      { id: 'devises',      label: 'Devises et taux',      icon: 'coins',      route: '/administration/devises',      permission: 'administration.devise.voir' },
      { id: 'societe',      label: 'Société',              icon: 'building-2', route: '/administration/societe',      permission: 'administration.societe.voir' },
      { id: 'numerotation', label: 'Numérotation',         icon: 'hash',       route: '/administration/numerotation', permission: 'administration.compteur.voir' },
    ]},
    { id: 'tracabilite', title: 'Traçabilité', items: [
      { id: 'audit',       label: "Journal d'audit", icon: 'history',     route: '/administration/audit',       permission: 'administration.audit.voir' },
      { id: 'connexions',  label: 'Connexions',      icon: 'log-in',      route: '/administration/connexions',  permission: 'administration.connexion.voir' },
      { id: 'documents',   label: 'Documents émis',  icon: 'file-check',  route: '/administration/documents',   permission: 'administration.document.voir' },
    ]},
  ],
};
