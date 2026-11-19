import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-de-valeur',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class DeValeurComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Valeur avant/après',
    subtitle: 'Valeur des lots avant et après traitement.',
    icon: 'trending-up',
    breadcrumb: ['Dépôts et traitement'],
    entityLabel: 'valeur avant/après',
  });
}
