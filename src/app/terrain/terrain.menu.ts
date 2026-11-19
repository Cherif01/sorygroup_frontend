import { ModuleMenuConfig } from '../core/models/menu.model';

export const TERRAIN_MENU: ModuleMenuConfig = {
  module: 'terrain',
  sections: [
    { id: 'producteurs', title: 'Producteurs et champs', items: [
      { id: 'producteurs', label: 'Producteurs', icon: 'users',          route: '/terrain/producteurs', permission: 'terrain.producteur.voir' },
      { id: 'champs',      label: 'Champs',      icon: 'sprout',         route: '/terrain/champs',      permission: 'terrain.champ.voir' },
      { id: 'visites',     label: 'Visites',     icon: 'clipboard-list', route: '/terrain/visites',     permission: 'terrain.visite.voir' },
      { id: 'carte',       label: 'Carte et zones', icon: 'map-pin',     route: '/terrain/carte',       permission: 'terrain.carte.voir' },
    ]},
    { id: 'collecte', title: 'Collecte', items: [
      { id: 'nouvelle-pesee', label: 'Nouvelle pesée', icon: 'plus',    route: '/terrain/pesees/nouvelle', permission: 'terrain.pesee.saisir' },
      { id: 'pesees',         label: 'Pesées',         icon: 'scale',   route: '/terrain/pesees',          permission: 'terrain.pesee.voir', badge: true },
      { id: 'recus',          label: 'Reçus de pesée', icon: 'receipt', route: '/terrain/recus',           permission: 'terrain.recu.voir' },
      { id: 'envois',         label: 'Envois au dépôt', icon: 'truck',  route: '/terrain/envois',          permission: 'terrain.bordereau.voir', badge: true },
    ]},
    { id: 'suivi', title: 'Suivi', items: [
      { id: 'rapports', label: 'Rapports', icon: 'file-text', route: '/terrain/rapports', permission: 'terrain.rapport.voir' },
    ]},
  ],
};
