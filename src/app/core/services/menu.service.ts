import { Injectable, computed, inject, signal } from '@angular/core';
import { ModuleId, STORAGE_KEYS } from '../../config';
import { MenuItem, MenuSection, ModuleMenuConfig } from '../models/menu.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly auth = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly _config = signal<ModuleMenuConfig | null>(null);
  private readonly _badges = signal<Record<string, number>>({});
  private readonly _collapsed = signal<boolean>(this.storage.get<boolean>(STORAGE_KEYS.sidebar) ?? false);
  private readonly _mobileOpen = signal<boolean>(false);

  readonly activeModule = computed<ModuleId | null>(() => this._config()?.module ?? null);

  readonly sections = computed<MenuSection[]>(() => {
    const cfg = this._config();
    if (!cfg) return [];
    return cfg.sections
      .filter(s => s.status !== 'soon')
      .map(s => ({ ...s, items: s.items.filter(i => !i.permission || this.auth.can(i.permission)) }))
      .filter(s => s.items.length > 0);
  });

  readonly items = computed<MenuItem[]>(() => this.sections().flatMap(s => s.items));

  readonly badges = this._badges.asReadonly();
  readonly collapsed = this._collapsed.asReadonly();
  readonly mobileOpen = this._mobileOpen.asReadonly();

  open(config: ModuleMenuConfig): void {
    this._config.set(config);
    this._badges.set({});
  }

  close(module: ModuleId): void {
    if (this._config()?.module !== module) return;
    this._config.set(null);
    this._badges.set({});
  }

  setBadges(counts: Record<string, number>): void { this._badges.set(counts); }
  setBadge(itemId: string, count: number): void { this._badges.update(b => ({ ...b, [itemId]: count })); }

  toggleCollapsed(): void {
    const v = !this._collapsed();
    this._collapsed.set(v);
    this.storage.set(STORAGE_KEYS.sidebar, v);
  }
  setCollapsed(v: boolean): void {
    this._collapsed.set(v);
    this.storage.set(STORAGE_KEYS.sidebar, v);
  }

  toggleMobile(): void { this._mobileOpen.update(v => !v); }
  closeMobile(): void { this._mobileOpen.set(false); }
}
