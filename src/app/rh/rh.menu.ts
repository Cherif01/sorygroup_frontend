import { ModuleMenuConfig } from '../core/models/menu.model';

export const RH_MENU: ModuleMenuConfig = {
  module: 'rh',
  sections: [
    { id: 'personnel', title: 'Personnel', items: [
      { id: 'employes',     label: 'Employés',           icon: 'users',      route: '/rh/employes',     permission: 'rh.employe.voir' },
      { id: 'contrats',     label: 'Contrats',           icon: 'file-text',  route: '/rh/contrats',     permission: 'rh.contrat.voir', badge: true },
      { id: 'organisation', label: 'Services et postes', icon: 'building-2', route: '/rh/organisation', permission: 'rh.organisation.voir' },
    ]},
    { id: 'temps', title: 'Temps de travail', items: [
      { id: 'presences', label: 'Présences', icon: 'calendar-check', route: '/rh/presences', permission: 'rh.presence.voir' },
      { id: 'conges',    label: 'Congés',    icon: 'calendar',       route: '/rh/conges',    permission: 'rh.conge.voir', badge: true },
      { id: 'missions',  label: 'Missions',  icon: 'route',          route: '/rh/missions',  permission: 'rh.mission.voir' },
    ]},
    { id: 'paie', title: 'Paie', items: [
      { id: 'paie',            label: 'Paie du mois',        icon: 'calculator',  route: '/rh/paie',            permission: 'rh.paie.voir' },
      { id: 'bulletins',       label: 'Bulletins',           icon: 'receipt',     route: '/rh/bulletins',       permission: 'rh.bulletin.voir' },
      { id: 'avances-salaire', label: 'Avances sur salaire', icon: 'hand-coins',  route: '/rh/avances-salaire', permission: 'rh.avance-salaire.voir', badge: true },
      { id: 'paiements',       label: 'Paiement des salaires', icon: 'banknote', route: '/rh/paiements',       permission: 'rh.salaire.voir', badge: true },
      { id: 'rubriques',       label: 'Rubriques et barème', icon: 'settings',    route: '/rh/rubriques',       permission: 'rh.rubrique.voir' },
    ]},
    { id: 'suivi', title: 'Suivi', items: [
      { id: 'rapports', label: 'Rapports', icon: 'file-text', route: '/rh/rapports', permission: 'rh.rapport.voir' },
    ]},
  ],
};
