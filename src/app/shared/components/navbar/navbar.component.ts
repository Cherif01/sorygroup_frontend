import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAME, APP_TAGLINE, APP_PATHS, moduleById } from '../../../config';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { IconComponent } from '../../ui/icon/icon.component';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly menu = inject(MenuService);
  protected readonly appName = APP_NAME;
  protected readonly appTagline = APP_TAGLINE;
  protected readonly paths = APP_PATHS;

  protected readonly moduleOpen = computed(() => {
    const id = this.menu.activeModule();
    return id ? moduleById(id) : null;
  });

  protected readonly accountOpen = signal(false);
  protected readonly notifOpen = signal(false);
  protected readonly notifications = signal<Array<{ id: string; title: string; description: string; time: string; read: boolean }>>([
    { id: '1', title: 'Nouvelle demande', description: 'Mamadou Bah a demandé une avance',    time: 'Il y a 5 min', read: false },
    { id: '2', title: 'Pesée validée',     description: 'Lot KOL-2026-012 prêt à partir',       time: 'Il y a 1 h',   read: false },
    { id: '3', title: 'Rapport disponible',description: 'Rapport de collecte semaine 46',       time: 'Hier',         read: true  },
  ]);
  protected readonly unread = computed(() => this.notifications().filter(n => !n.read).length);

  toggleSidebar() { this.menu.toggleCollapsed(); }
  toggleMobile()  { this.menu.toggleMobile(); }

  toggleAccount() {
    this.accountOpen.update(v => !v);
    if (this.accountOpen()) this.notifOpen.set(false);
  }
  toggleNotif() {
    this.notifOpen.update(v => !v);
    if (this.notifOpen()) this.accountOpen.set(false);
  }

  markAllRead() {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  logout() {
    this.accountOpen.set(false);
    this.auth.closeSession();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t.closest('.navbar__account') && this.accountOpen()) this.accountOpen.set(false);
    if (!t.closest('.navbar__notif') && this.notifOpen()) this.notifOpen.set(false);
  }
}
