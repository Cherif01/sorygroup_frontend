import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAME, MODULES } from '../../../config';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-portal-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class PortalHomeComponent {
  protected readonly auth = inject(AuthService);
  protected readonly appName = APP_NAME;

  protected readonly tiles = computed(() => {
    const permissions = this.auth.currentUser()?.permissions ?? [];
    const isAdmin = permissions.some(p => p.startsWith('administration.'));
    return [...MODULES]
      .filter(m => m.status === 'open' || isAdmin || this.auth.canOpen(m.id))
      .sort((a, b) => a.order - b.order);
  });

  protected readonly openCount = computed(() => this.tiles().filter(t => t.status === 'open').length);
  protected readonly soonCount = computed(() => this.tiles().filter(t => t.status === 'soon').length);
}
