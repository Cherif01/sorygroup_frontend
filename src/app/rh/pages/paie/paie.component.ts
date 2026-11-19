import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-rh-paie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class RhPaieComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Paie du mois',
    subtitle: 'Préparation de la paie.',
    icon: 'calculator',
    breadcrumb: ['Ressources humaines'],
    entityLabel: 'paie du mois',
  });
}
