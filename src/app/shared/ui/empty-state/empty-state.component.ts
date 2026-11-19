import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="empty">
      <div class="empty__icon"><app-icon [name]="icon()" [size]="40" /></div>
      <h3>{{ title() }}</h3>
      @if (description()) { <p>{{ description() }}</p> }
      <div class="empty__actions"><ng-content></ng-content></div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .empty {
      padding: var(--space-12) var(--space-6);
      text-align: center;
      background: var(--color-surface);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-card-lg);
    }
    .empty__icon {
      width: 80px; height: 80px;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--color-primary-softer);
      color: var(--color-primary);
      border-radius: 50%;
      margin: 0 auto var(--space-4);
    }
    h3 { font-family: var(--font-title); margin-bottom: var(--space-2); }
    p { color: var(--color-text-muted); max-width: 400px; margin: 0 auto; }
    .empty__actions { margin-top: var(--space-5); display: flex; justify-content: center; gap: var(--space-3); flex-wrap: wrap; }
  `],
})
export class EmptyStateComponent {
  readonly icon = input<string>('info');
  readonly title = input.required<string>();
  readonly description = input<string>('');
}
