import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from '../shared/layouts/module-layout/module-layout.component';
import { ADMINISTRATION_MENU } from './administration.menu';

const placeholder = () => import('../shared/ui/page-placeholder/page-placeholder.component').then(m => m.PagePlaceholderComponent);

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    data: { menu: ADMINISTRATION_MENU },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'utilisateurs' },

      // Accès
      { path: 'utilisateurs',     title: 'Utilisateurs', loadComponent: () => import('./pages/utilisateurs/utilisateurs.component').then(m => m.AdUtilisateursComponent) },
      { path: 'utilisateurs/:id', title: 'Utilisateur',  data: { title: 'Fiche utilisateur' }, loadComponent: placeholder },
      { path: 'roles',            title: 'Rôles',        loadComponent: () => import('./pages/roles/roles.component').then(m => m.AdRolesComponent) },

      // Référentiels
      { path: 'produits',         title: 'Produits',     loadComponent: () => import('./pages/produits/produits.component').then(m => m.AdProduitsComponent) },
      { path: 'produits/:id',     title: 'Produit',      data: { title: 'Fiche produit' }, loadComponent: placeholder },
      { path: 'campagnes',        title: 'Campagnes',    loadComponent: () => import('./pages/campagnes/campagnes.component').then(m => m.AdCampagnesComponent) },
      { path: 'zones',            title: 'Zones',        loadComponent: () => import('./pages/zones/zones.component').then(m => m.AdZonesComponent) },
      { path: 'depots',           title: 'Dépôts',       loadComponent: () => import('./pages/depots/depots.component').then(m => m.AdDepotsComponent) },

      // Réglages
      { path: 'parametres',       title: 'Paramètres',   loadComponent: () => import('./pages/parametres/parametres.component').then(m => m.AdParametresComponent) },
      { path: 'devises',          title: 'Devises',      loadComponent: () => import('./pages/devises/devises.component').then(m => m.AdDevisesComponent) },
      { path: 'societe',          title: 'Société',      loadComponent: () => import('./pages/societe/societe.component').then(m => m.AdSocieteComponent) },
      { path: 'numerotation',     title: 'Numérotation', loadComponent: () => import('./pages/numerotation/numerotation.component').then(m => m.AdNumerotationComponent) },

      // Traçabilité
      { path: 'audit',            title: "Journal d'audit", loadComponent: () => import('./pages/audit/audit.component').then(m => m.AdAuditComponent) },
      { path: 'connexions',       title: 'Connexions',   loadComponent: () => import('./pages/connexions/connexions.component').then(m => m.AdConnexionsComponent) },
      { path: 'documents',        title: 'Documents',    loadComponent: () => import('./pages/documents/documents.component').then(m => m.AdDocumentsComponent) },
    ],
  },
];
