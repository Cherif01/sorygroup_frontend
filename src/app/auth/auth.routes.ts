import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Connexion',
  },
  {
    path: 'mot-de-passe',
    loadComponent: () => import('./pages/mot-de-passe/mot-de-passe.component').then(m => m.MotDePasseComponent),
    title: 'Changer de mot de passe',
  },
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () => import('./pages/mot-de-passe-oublie/mot-de-passe-oublie.component').then(m => m.MotDePasseOublieComponent),
    title: 'Mot de passe oublié',
  },
];
