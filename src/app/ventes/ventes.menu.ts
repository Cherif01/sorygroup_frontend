import { ModuleMenuConfig } from '../core/models/menu.model';

export const VENTES_MENU: ModuleMenuConfig = {
  module: 'ventes',
  sections: [
    { id: 'ventes', title: 'Ventes', items: [
      { id: 'clients',       label: 'Clients',       icon: 'building-2',    route: '/ventes/clients',       permission: 'ventes.client.voir' },
      { id: 'lots-vente',    label: 'Lots de vente', icon: 'package-check', route: '/ventes/lots-vente',    permission: 'ventes.lot-vente.voir' },
      { id: 'contrats',      label: 'Contrats et prix', icon: 'handshake',  route: '/ventes/contrats',      permission: 'ventes.contrat.voir' },
      { id: 'factures',      label: 'Factures',      icon: 'file-text',     route: '/ventes/factures',      permission: 'ventes.facture.voir', badge: true },
      { id: 'encaissements', label: 'Encaissements', icon: 'hand-coins',    route: '/ventes/encaissements', permission: 'ventes.encaissement.voir', badge: true },
    ]},
    { id: 'marges', title: 'Coûts et marges', items: [
      { id: 'cout-revient', label: 'Coût de revient', icon: 'calculator', route: '/ventes/cout-revient', permission: 'ventes.cout.voir' },
      { id: 'marges',       label: 'Marges',          icon: 'percent',    route: '/ventes/marges',       permission: 'ventes.marge.voir' },
    ]},
    { id: 'import-export', title: 'Import-export', items: [
      { id: 'dossiers-export', label: "Dossiers d'export", icon: 'ship',        route: '/ventes/dossiers-export', permission: 'ventes.dossier-export.voir', badge: true },
      { id: 'expeditions',     label: 'Suivi expéditions', icon: 'route',       route: '/ventes/expeditions',     permission: 'ventes.expedition.voir' },
      { id: 'dossiers-import', label: "Dossiers d'import", icon: 'package',     route: '/ventes/dossiers-import', permission: 'ventes.dossier-import.voir' },
      { id: 'documents-exiges',label: 'Documents exigés',  icon: 'list-checks', route: '/ventes/documents-exiges',permission: 'ventes.type-document.voir' },
    ]},
    { id: 'suivi', title: 'Suivi', items: [
      { id: 'rapports', label: 'Rapports', icon: 'file-text', route: '/ventes/rapports', permission: 'ventes.rapport.voir' },
    ]},
  ],
};
