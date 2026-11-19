import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-de-sorties',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class DeSortiesComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Sorties',
    subtitle: 'Lots de vente sortis du dépôt.',
    icon: 'log-out',
    breadcrumb: ['Dépôts et traitement'],
    entityLabel: 'sorties',
  });
}
