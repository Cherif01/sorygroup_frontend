import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-de-inventaires',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class DeInventairesComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Inventaires',
    subtitle: 'Inventaires datés et écarts.',
    icon: 'clipboard-check',
    breadcrumb: ['Dépôts et traitement'],
    entityLabel: 'inventaires',
  });
}
