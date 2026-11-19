import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { APP_PATHS, ModuleId, Permission, moduleById } from '../../config';
import { ModuleMenuConfig } from '../models/menu.model';
import { AuthService } from '../services/auth.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree([APP_PATHS.auth]);
};

export const guestGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return !auth.isAuthenticated() ? true : router.createUrlTree([auth.landingUrl()]);
};

export const moduleGuard = (id: ModuleId): CanMatchFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return moduleById(id).status === 'open' && auth.canOpen(id)
    ? true
    : router.createUrlTree([APP_PATHS.portail]);
};

export const sectionGuard = (menu: ModuleMenuConfig, sectionId: string): CanMatchFn => () => {
  const section = menu.sections.find(s => s.id === sectionId);
  return section !== undefined && section.status !== 'soon';
};

export const permissionGuard = (permission: Permission): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.can(permission) ? true : router.createUrlTree([APP_PATHS.portail]);
};

/** Première URL du menu que l'utilisateur a le droit d'ouvrir. */
export const moduleHome = (menu: ModuleMenuConfig): string => {
  // Retour synchrone via fonction factory - l'appel se fait depuis une route redirectTo
  // On renvoie la route du premier item ; la permission réelle est vérifiée par le permissionGuard de la page.
  const first = menu.sections
    .filter(s => s.status !== 'soon')
    .flatMap(s => s.items)[0];
  return first?.route ?? APP_PATHS.portail;
};
