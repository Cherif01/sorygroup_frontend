import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-pi-objectifs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class PiObjectifsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Objectifs de collecte',
    subtitle: 'Cibles saisonnières par produit et zone.',
    icon: 'target',
    breadcrumb: ['Pilotage'],
    entityLabel: 'objectifs de collecte',
  });
}
