import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-pi-tableau-de-bord',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class PiTableauDeBordComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Tableau de bord',
    subtitle: 'Vue d\'ensemble de la campagne.',
    icon: 'layout-dashboard',
    breadcrumb: ['Pilotage'],
    entityLabel: 'tableau de bord',
  });
}
