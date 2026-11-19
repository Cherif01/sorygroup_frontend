import { Routes } from '@angular/router';
import { PortalLayoutComponent } from '../shared/layouts/portal-layout/portal-layout.component';

export const PORTAIL_ROUTES: Routes = [
  {
    path: '',
    component: PortalLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home.component').then(m => m.PortalHomeComponent),
        title: 'Portail',
      },
    ],
  },
];
