import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard, guestGuard, moduleGuard } from './core/guards/guards';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      return auth.isAuthenticated() ? auth.landingUrl() : '/site-web/home';
    },
  },

  {
    path: 'site-web',
    loadChildren: () => import('./site-web/site-web.routes').then(m => m.SITE_WEB_ROUTES),
  },

  {
    path: 'auth',
    canMatch: [guestGuard],
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  {
    path: 'portail',
    canMatch: [authGuard],
    loadChildren: () => import('./portail/portail.routes').then(m => m.PORTAIL_ROUTES),
  },

  // Les 8 applications — toutes lazy
  { path: 'pilotage',       canMatch: [authGuard, moduleGuard('pilotage')],       loadChildren: () => import('./pilotage/pilotage.routes').then(m => m.PILOTAGE_ROUTES) },
  { path: 'terrain',        canMatch: [authGuard, moduleGuard('terrain')],        loadChildren: () => import('./terrain/terrain.routes').then(m => m.TERRAIN_ROUTES) },
  { path: 'depots',         canMatch: [authGuard, moduleGuard('depots')],         loadChildren: () => import('./depots/depots.routes').then(m => m.DEPOTS_ROUTES) },
  { path: 'ventes',         canMatch: [authGuard, moduleGuard('ventes')],         loadChildren: () => import('./ventes/ventes.routes').then(m => m.VENTES_ROUTES) },
  { path: 'comptabilite',   canMatch: [authGuard, moduleGuard('comptabilite')],   loadChildren: () => import('./comptabilite/comptabilite.routes').then(m => m.COMPTABILITE_ROUTES) },
  { path: 'rh',             canMatch: [authGuard, moduleGuard('rh')],             loadChildren: () => import('./rh/rh.routes').then(m => m.RH_ROUTES) },
  { path: 'administration', canMatch: [authGuard, moduleGuard('administration')], loadChildren: () => import('./administration/administration.routes').then(m => m.ADMINISTRATION_ROUTES) },
  { path: 'mon-espace',     canMatch: [authGuard, moduleGuard('mon-espace')],     loadChildren: () => import('./mon-espace/mon-espace.routes').then(m => m.MON_ESPACE_ROUTES) },

  {
    path: 'notfound',
    loadComponent: () => import('./shared/components/notfound/notfound.component').then(m => m.NotfoundComponent),
  },
  { path: '**', redirectTo: 'notfound' },
];
