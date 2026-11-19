import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-site-page-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="phero">
      <div class="phero__inner container">
        <span class="phero__eyebrow">{{ eyebrow() }}</span>
        <h1 class="phero__title">{{ title() }}</h1>
        @if (subtitle()) { <p class="phero__sub">{{ subtitle() }}</p> }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .phero {
      position: relative;
      padding: calc(var(--topbar-h) + var(--space-16)) 0 var(--space-12);
      background:
        radial-gradient(ellipse at 10% 20%, rgba(92, 176, 138, .15), transparent 50%),
        radial-gradient(ellipse at 90% 80%, rgba(31, 111, 74, .1), transparent 50%),
        linear-gradient(180deg, var(--brand-50) 0%, var(--color-surface) 100%);
      border-bottom: 1px solid var(--color-border);
      overflow: hidden;
    }
    .phero__inner { position: relative; text-align: center; max-width: 820px; }
    .phero__eyebrow {
      display: inline-block;
      padding: 6px 14px;
      background: var(--color-primary-soft);
      color: var(--color-primary-dark);
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: var(--space-3);
    }
    .phero__title {
      font-family: var(--font-title);
      font-size: clamp(32px, 5vw, 56px);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: var(--space-3);
    }
    .phero__sub {
      font-size: var(--text-md);
      color: var(--color-text-muted);
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.6;
    }
  `],
})
export class PageHeroComponent {
  readonly eyebrow = input<string>('Sory Group');
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
