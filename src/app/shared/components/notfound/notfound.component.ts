import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_PATHS } from '../../../config';

@Component({
  selector: 'app-notfound',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="notfound">
      <div class="notfound__card">
        <div class="notfound__code">404</div>
        <h1>Page introuvable</h1>
        <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <div class="notfound__actions">
          <a [routerLink]="paths.portail" class="btn btn--primary">Retour au portail</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--color-bg); }
    .notfound {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: var(--space-6);
    }
    .notfound__card {
      max-width: 480px; width: 100%;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card-lg);
      padding: var(--space-10);
      text-align: center;
      box-shadow: var(--shadow-2);
    }
    .notfound__code {
      font-family: var(--font-title);
      font-size: 96px; font-weight: 800;
      background: linear-gradient(135deg, var(--brand-500), var(--brand-800));
      -webkit-background-clip: text; background-clip: text;
      color: transparent;
      line-height: 1; margin-bottom: var(--space-4);
    }
    h1 { margin-bottom: var(--space-2); }
    p { color: var(--color-text-muted); margin-bottom: var(--space-6); }
    .notfound__actions { display: flex; justify-content: center; }
  `],
})
export class NotfoundComponent {
  protected readonly paths = APP_PATHS;
}
