import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_NAME } from '../../../config';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <span class="footer__logo"><img src="logo.png" alt="" /></span>
          <span class="footer__text">
            <strong>{{ appName }}</strong>
            <small>© {{ year }} · Tous droits réservés</small>
          </span>
        </div>
        <nav class="footer__links">
          <a href="#">Mentions légales</a>
          <a href="#">Confidentialité</a>
          <a href="#">Support</a>
          <span class="footer__version">v1.0.0</span>
        </nav>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: contents; }
    .footer {
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      padding: var(--space-4) var(--space-6);
    }
    .footer__inner {
      max-width: var(--content-max);
      margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      gap: var(--space-4); flex-wrap: wrap;
    }
    .footer__brand { display: flex; align-items: center; gap: var(--space-3); }
    .footer__logo {
      width: 32px; height: 32px;
      flex-shrink: 0;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--white);
      border: 1px solid var(--color-border);
      border-radius: 50%;
      box-shadow: var(--shadow-1);
      overflow: hidden;
      padding: 2px;
      img { width: 100%; height: 100%; object-fit: contain; display: block; }
    }
    .footer__text { display: flex; flex-direction: column; line-height: 1.2; }
    .footer__text strong { font-family: var(--font-title); font-size: var(--text-sm); font-weight: var(--weight-bold); }
    .footer__text small { font-size: 11px; color: var(--color-text-subtle); }
    .footer__links { display: flex; align-items: center; gap: var(--space-5); flex-wrap: wrap; }
    .footer__links a { font-size: var(--text-xs); color: var(--color-text-muted); }
    .footer__links a:hover { color: var(--color-primary); }
    .footer__version {
      padding: 2px var(--space-2);
      background: var(--color-primary-softer);
      color: var(--color-primary);
      font-family: var(--font-mono);
      font-size: 10px; font-weight: 600;
      border-radius: var(--radius-pill);
    }
  `],
})
export class FooterComponent {
  protected readonly appName = APP_NAME;
  protected readonly year = new Date().getFullYear();
}
