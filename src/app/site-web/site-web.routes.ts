import { Routes } from '@angular/router';
import { SiteLayoutComponent } from './layout/site-layout.component';

export const SITE_WEB_ROUTES: Routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () => import('./pages/accueil/accueil.component').then(m => m.AccueilComponent),
        title: 'Sory Group SARLU — Chaîne agricole',
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent),
        title: 'Nos services — Sory Group',
      },
      {
        path: 'apropos',
        loadComponent: () => import('./pages/apropos/apropos.component').then(m => m.AproposComponent),
        title: 'À propos — Sory Group',
      },
      {
        path: 'projets',
        loadComponent: () => import('./pages/projets/projets.component').then(m => m.ProjetsComponent),
        title: 'Nos projets — Sory Group',
      },
      {
        path: 'partenariat',
        loadComponent: () => import('./pages/partenariat/partenariat.component').then(m => m.PartenariatComponent),
        title: 'Devenir partenaire — Sory Group',
      },
    ],
  },
];
