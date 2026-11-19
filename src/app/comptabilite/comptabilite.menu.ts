import { ModuleMenuConfig } from '../core/models/menu.model';

export const COMPTABILITE_MENU: ModuleMenuConfig = {
  module: 'comptabilite',
  sections: [
    { id: 'avances', title: 'Avances aux producteurs', items: [
      { id: 'avances-demandes',       label: "Demandes d'avance",      icon: 'hand-coins',     route: '/comptabilite/avances/demandes',       permission: 'comptabilite.avance.voir' },
      { id: 'avances-validation',     label: 'Validation',             icon: 'stamp',          route: '/comptabilite/avances/validation',     permission: 'comptabilite.avance.valider', badge: true },
      { id: 'avances-decaissement',   label: 'Décaissement',           icon: 'banknote',       route: '/comptabilite/avances/decaissement',   permission: 'comptabilite.avance.verser',  badge: true },
      { id: 'avances-remboursements', label: 'Suivi des remboursements', icon: 'repeat',       route: '/comptabilite/avances/remboursements', permission: 'comptabilite.remboursement.voir' },
      { id: 'avances-sans-livraison', label: 'Avances sans livraison', icon: 'triangle-alert', route: '/comptabilite/avances/sans-livraison', permission: 'comptabilite.retard.voir', badge: true },
    ]},
    { id: 'tresorerie', title: 'Trésorerie', items: [
      { id: 'tresorerie-comptes',               label: 'Caisses et comptes',          icon: 'wallet',           route: '/comptabilite/tresorerie/comptes',               permission: 'comptabilite.tresorerie.voir' },
      { id: 'tresorerie-journal',               label: 'Journal de caisse et banque', icon: 'book-open',        route: '/comptabilite/tresorerie/journal',               permission: 'comptabilite.tresorerie.voir' },
      { id: 'tresorerie-paiements-producteurs', label: 'Paiements aux producteurs',   icon: 'users',            route: '/comptabilite/tresorerie/paiements-producteurs', permission: 'comptabilite.paiement-producteur.voir', badge: true },
      { id: 'tresorerie-encaissements',         label: 'Encaissements clients',       icon: 'download',         route: '/comptabilite/tresorerie/encaissements',         permission: 'comptabilite.encaissement.voir', badge: true },
      { id: 'tresorerie-transferts',            label: 'Transferts de fonds',         icon: 'arrow-left-right', route: '/comptabilite/tresorerie/transferts',            permission: 'comptabilite.transfert.voir', badge: true },
      { id: 'tresorerie-clotures-caisse',       label: 'Clôtures de caisse',          icon: 'lock',             route: '/comptabilite/tresorerie/clotures-caisse',       permission: 'comptabilite.cloture-caisse.voir' },
      { id: 'tresorerie-rapprochements',        label: 'Rapprochements bancaires',    icon: 'landmark',         route: '/comptabilite/tresorerie/rapprochements',        permission: 'comptabilite.rapprochement.voir' },
    ]},
    { id: 'depenses', title: 'Dépenses', items: [
      { id: 'depenses-liste',        label: 'Dépenses',      icon: 'receipt',  route: '/comptabilite/depenses/liste',        permission: 'comptabilite.depense.voir', badge: true },
      { id: 'depenses-reglements',   label: 'Règlements',    icon: 'banknote', route: '/comptabilite/depenses/reglements',   permission: 'comptabilite.reglement.voir', badge: true },
      { id: 'depenses-fournisseurs', label: 'Fournisseurs',  icon: 'truck',    route: '/comptabilite/depenses/fournisseurs', permission: 'comptabilite.fournisseur.voir' },
      { id: 'depenses-natures',      label: 'Natures de dépense', icon: 'tag', route: '/comptabilite/depenses/natures',      permission: 'comptabilite.nature-depense.voir' },
    ]},
    { id: 'analyse', title: 'Coûts et résultat', items: [
      { id: 'analyse-cout-revient',      label: 'Coût de revient',    icon: 'calculator',   route: '/comptabilite/analyse/cout-revient',       permission: 'comptabilite.cout.voir' },
      { id: 'analyse-resultat-campagne', label: 'Résultat de campagne', icon: 'chart-column', route: '/comptabilite/analyse/resultat-campagne', permission: 'comptabilite.resultat.voir' },
      { id: 'analyse-exports',           label: 'Rapports et exports', icon: 'download',    route: '/comptabilite/analyse/exports',           permission: 'comptabilite.export.faire' },
    ]},
    { id: 'generale', title: 'Comptabilité générale', status: 'soon', items: [
      { id: 'generale-ecritures',     label: 'Écritures',       icon: 'book',      route: '/comptabilite/generale/ecritures',     permission: 'comptabilite.ecriture.voir' },
      { id: 'generale-grand-livre',   label: 'Grand livre',     icon: 'book-open', route: '/comptabilite/generale/grand-livre',   permission: 'comptabilite.livre.voir' },
      { id: 'generale-balance',       label: 'Balance générale', icon: 'scale',    route: '/comptabilite/generale/balance',       permission: 'comptabilite.livre.voir' },
    ]},
  ],
};
