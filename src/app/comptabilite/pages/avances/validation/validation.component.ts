import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-avances-validation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoAvancesValidationComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Validation',
    subtitle: 'Validation des demandes d\'avance.',
    icon: 'stamp',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'validation',
  });
}
