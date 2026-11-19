import { ModuleMenuConfig } from '../core/models/menu.model';

export const MON_ESPACE_MENU: ModuleMenuConfig = {
  module: 'mon-espace',
  sections: [
    { id: 'compte', items: [
      { id: 'compte',     label: 'Mon compte',     icon: 'user',       route: '/mon-espace/compte',     permission: 'mon-espace.compte.voir' },
      { id: 'livraisons', label: 'Mes livraisons', icon: 'scale',      route: '/mon-espace/livraisons', permission: 'mon-espace.compte.voir' },
      { id: 'paiements',  label: 'Mes paiements',  icon: 'banknote',   route: '/mon-espace/paiements',  permission: 'mon-espace.compte.voir' },
      { id: 'avances',    label: 'Mes avances',    icon: 'hand-coins', route: '/mon-espace/avances',    permission: 'mon-espace.compte.voir' },
      { id: 'champs',     label: 'Mes champs',     icon: 'sprout',     route: '/mon-espace/champs',     permission: 'mon-espace.compte.voir' },
    ]},
  ],
};
