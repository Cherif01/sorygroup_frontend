import { ModuleMenuConfig } from '../core/models/menu.model';

export const PILOTAGE_MENU: ModuleMenuConfig = {
  module: 'pilotage',
  sections: [
    { id: 'lecture', items: [
      { id: 'tableau-de-bord', label: 'Tableau de bord',  icon: 'layout-dashboard', route: '/pilotage/tableau-de-bord', permission: 'pilotage.tableau.voir' },
      { id: 'collecte-zones',  label: 'Collecte par zone', icon: 'map',              route: '/pilotage/collecte-zones',  permission: 'pilotage.tableau.voir' },
      { id: 'objectifs',       label: 'Objectifs de collecte', icon: 'target',       route: '/pilotage/objectifs',       permission: 'pilotage.objectif.voir' },
    ]},
    { id: 'decisions', title: 'À traiter', items: [
      { id: 'alertes',       label: 'Alertes',       icon: 'bell',  route: '/pilotage/alertes',       permission: 'pilotage.alerte.voir', badge: true },
      { id: 'approbations',  label: 'Approbations',  icon: 'stamp', route: '/pilotage/approbations',  permission: 'pilotage.approbation.voir', badge: true },
    ]},
    { id: 'suivi', title: 'Suivi', items: [
      { id: 'rapports', label: 'Rapports', icon: 'file-text', route: '/pilotage/rapports', permission: 'pilotage.rapport.voir' },
    ]},
  ],
};
