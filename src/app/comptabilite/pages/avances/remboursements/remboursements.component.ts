import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-avances-remboursements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoAvancesRemboursementsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Remboursements',
    subtitle: 'Suivi des remboursements.',
    icon: 'repeat',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'remboursements',
  });
}
