import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import {
  API_PATHS, APP_PATHS, BASE_URL, MODULES, ModuleDef, ModuleId, Permission, STORAGE_KEYS,
} from '../../config';
import { AuthUser } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  private readonly permissionSet = computed(
    () => new Set<string>(this.currentUser()?.permissions ?? []),
  );

  readonly modules = computed<ModuleDef[]>(() =>
    MODULES.filter(m => m.status === 'open' && this.canOpen(m.id)).sort((a, b) => a.order - b.order),
  );

  readonly allVisibleModules = computed<ModuleDef[]>(() => {
    const isAdmin = Array.from(this.permissionSet()).some(p => p.startsWith('administration.'));
    return MODULES.filter(m => m.status === 'open' || isAdmin || this.canOpen(m.id)).sort((a, b) => a.order - b.order);
  });

  constructor() {
    this.hydrateFromStorage();
  }

  can(permission: Permission): boolean {
    const set = this.permissionSet();
    if (set.has('*' as Permission)) return true;
    if (set.has(permission)) return true;
    const module = permission.split('.')[0];
    return set.has(`${module}.*` as Permission);
  }

  canOpen(id: ModuleId): boolean {
    const perms = this.currentUser()?.permissions ?? [];
    if (perms.includes('*' as Permission)) return true;
    if (perms.includes(`${id}.*` as Permission)) return true;
    const prefix = id + '.';
    return perms.some(p => p.startsWith(prefix));
  }

  landingUrl(): string {
    if (!this.isAuthenticated()) return APP_PATHS.auth;
    if (this.currentUser()?.est_mot_de_passe_provisoire) return APP_PATHS.motDePasse;
    return APP_PATHS.portail;
  }

  hydrateFromStorage(): void {
    const token = this.storage.get<string>(STORAGE_KEYS.token);
    const user = this.storage.get<AuthUser>(STORAGE_KEYS.user);
    if (token && user) {
      // Mode démo (apiUrl vide) : garantir le wildcard '*' pour que tous les menus s'affichent,
      // même si l'utilisateur a été enregistré avec une ancienne liste de permissions.
      if (!BASE_URL && !(user.permissions ?? []).includes('*' as Permission)) {
        user.permissions = ['*' as Permission];
        this.storage.set(STORAGE_KEYS.user, user);
      }
      this.currentUser.set(user);
    } else {
      this.currentUser.set(null);
    }
  }

  getToken(): string | null {
    return this.storage.get<string>(STORAGE_KEYS.token);
  }

  login(telephone: string, motDePasse: string): Observable<{ token: string; user: AuthUser }> {
    // Mock de démo : à remplacer par l'appel réel une fois l'API prête.
    if (!BASE_URL) {
      const demo = this.demoLogin(telephone, motDePasse);
      this.storage.set(STORAGE_KEYS.token, demo.token);
      this.storage.set(STORAGE_KEYS.user, demo.user);
      this.currentUser.set(demo.user);
      void this.router.navigateByUrl(this.landingUrl());
      return of(demo);
    }
    return this.http
      .post<{ token: string; user: AuthUser }>(BASE_URL + API_PATHS.login, {
        telephone, mot_de_passe: motDePasse,
      })
      .pipe(tap(({ token, user }) => {
        this.storage.set(STORAGE_KEYS.token, token);
        this.storage.set(STORAGE_KEYS.user, user);
        this.currentUser.set(user);
        void this.router.navigateByUrl(this.landingUrl());
      }));
  }

  closeSession(): void {
    this.storage.remove(STORAGE_KEYS.token);
    this.storage.remove(STORAGE_KEYS.user);
    this.currentUser.set(null);
    void this.router.navigateByUrl(APP_PATHS.auth);
  }

  /** Utilisateur de démo : toutes les permissions via wildcard. */
  private demoLogin(telephone: string, _motDePasse: string): { token: string; user: AuthUser } {
    return {
      token: 'demo-token-' + Date.now(),
      user: {
        id: 1, nom: 'SORY', prenom: 'Fatoumata', initiales: 'FS',
        telephone, email: 'demo@sorygroup.com',
        role: { code: 'admin', libelle: 'Administrateur' },
        permissions: ['*' as Permission],
        perimetre: { zone_ids: [], depot_ids: [] },
        producteur_id: null,
        est_mot_de_passe_provisoire: false,
      },
    };
  }
}
