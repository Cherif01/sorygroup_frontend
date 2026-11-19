import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { STORAGE_KEYS } from '../../../config';
import { ModuleMenuConfig } from '../../../core/models/menu.model';
import { MenuService } from '../../../core/services/menu.service';
import { StorageService } from '../../../core/services/storage.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-module-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="shell">
      <app-sidebar />
      <div class="shell__main">
        <app-navbar />
        <main class="shell__content"><router-outlet /></main>
        <app-footer />
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .shell {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg);
    }
    .shell__main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .shell__content {
      flex: 1;
      padding: var(--space-6);
      max-width: 100%;
    }
    @media (max-width: 768px) {
      .shell__content { padding: var(--space-4); }
    }
  `],
})
export class ModuleLayoutComponent implements OnInit, OnDestroy {
  private readonly menu = inject(MenuService);
  private readonly storage = inject(StorageService);
  private readonly config = inject(ActivatedRoute).snapshot.data['menu'] as ModuleMenuConfig;

  ngOnInit(): void {
    if (this.config) {
      this.menu.open(this.config);
      this.storage.set(STORAGE_KEYS.lastModule, this.config.module);
    }
  }

  ngOnDestroy(): void {
    if (this.config) this.menu.close(this.config.module);
  }
}
