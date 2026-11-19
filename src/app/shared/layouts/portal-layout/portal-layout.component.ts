import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-portal-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="portal">
      <app-navbar />
      <main class="portal__main"><router-outlet /></main>
      <app-footer />
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .portal { min-height: 100vh; display: flex; flex-direction: column; background: var(--color-bg); }
    .portal__main { flex: 1; }
  `],
})
export class PortalLayoutComponent {}
