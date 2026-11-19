import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-de-stock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class DeStockComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Stock et mouvements',
    subtitle: 'Stock courant et historique.',
    icon: 'boxes',
    breadcrumb: ['Dépôts et traitement'],
    entityLabel: 'stock et mouvements',
  });
}
