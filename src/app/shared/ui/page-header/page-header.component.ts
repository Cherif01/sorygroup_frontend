import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div class="page-header__text">
        @if (breadcrumb().length) {
          <nav class="breadcrumb">
            @for (b of breadcrumb(); track $index) {
              <span>{{ b }}</span>
              @if (!$last) { <span>/</span> }
            }
          </nav>
        }
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (subtitle()) { <p class="page-header__subtitle">{{ subtitle() }}</p> }
      </div>
      <div class="page-header__actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly breadcrumb = input<string[]>([]);
}
