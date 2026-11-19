import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-ve-expeditions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class VeExpeditionsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Suivi des expéditions',
    subtitle: 'Suivi des conteneurs.',
    icon: 'route',
    breadcrumb: ['Ventes et import-export'],
    entityLabel: 'suivi des expéditions',
  });
}
