import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { moduleById } from '../../../config';
import { MenuItem, MenuSection } from '../../../core/models/menu.model';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly menu = inject(MenuService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly activeModule = computed(() => {
    const id = this.menu.activeModule();
    return id ? moduleById(id) : null;
  });

  private readonly url = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );

  protected readonly currentSection = computed(() =>
    this.menu.sections().find(s => s.items.some(i => this.url().startsWith(i.route)))?.id ?? null,
  );

  protected readonly expanded = signal<Record<string, boolean>>({});
  protected readonly search = signal<string>('');

  protected readonly filteredSections = computed<MenuSection[]>(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.menu.sections();
    return this.menu.sections()
      .map(s => ({ ...s, items: s.items.filter(i => i.label.toLowerCase().includes(q)) }))
      .filter(s => s.items.length > 0);
  });

  /** Auto-ouverture de la section de la page courante. */
  constructor() {
    effect(() => {
      const current = this.currentSection();
      if (current) {
        this.expanded.update(e => ({ ...e, [current]: true }));
      }
    });
  }

  protected isOpen(section: MenuSection): boolean {
    if (!section.title) return true;
    return this.expanded()[section.id] ?? false;
  }

  protected toggle(sectionId: string): void {
    this.expanded.update(e => ({ ...e, [sectionId]: !e[sectionId] }));
  }

  protected trackSection = (_: number, s: MenuSection) => s.id;
  protected trackItem = (_: number, i: MenuItem) => i.id;

  closeMobile() { this.menu.closeMobile(); }
}
