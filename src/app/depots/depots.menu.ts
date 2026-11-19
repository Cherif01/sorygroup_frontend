import { ModuleMenuConfig } from '../core/models/menu.model';

export const DEPOTS_MENU: ModuleMenuConfig = {
  module: 'depots',
  sections: [
    { id: 'lots', title: 'Réception et lots', items: [
      { id: 'entrees',    label: 'Entrées',             icon: 'package',       route: '/depots/entrees',    permission: 'depots.entree.voir', badge: true },
      { id: 'lots',       label: 'Lots au dépôt',       icon: 'layers',        route: '/depots/lots',       permission: 'depots.lot.voir',    badge: true },
      { id: 'traitement', label: 'Traitement',          icon: 'sun',           route: '/depots/traitement', permission: 'depots.traitement.voir' },
      { id: 'valeur',     label: 'Valeur avant/après',  icon: 'trending-up',   route: '/depots/valeur',     permission: 'depots.valeur.voir' },
      { id: 'sorties',    label: 'Sorties',             icon: 'log-out',       route: '/depots/sorties',    permission: 'depots.sortie.voir', badge: true },
    ]},
    { id: 'stock', title: 'Stock', items: [
      { id: 'stock',        label: 'Stock et mouvements', icon: 'boxes',           route: '/depots/stock',        permission: 'depots.stock.voir' },
      { id: 'inventaires',  label: 'Inventaires',         icon: 'clipboard-check', route: '/depots/inventaires',  permission: 'depots.inventaire.voir' },
    ]},
    { id: 'suivi', title: 'Suivi', items: [
      { id: 'rapports', label: 'Rapports', icon: 'file-text', route: '/depots/rapports', permission: 'depots.rapport.voir' },
    ]},
  ],
};
