import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-me-avances',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class MeAvancesComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Mes avances',
    subtitle: 'Mes avances et remboursements.',
    icon: 'hand-coins',
    breadcrumb: ['Mon espace'],
    entityLabel: 'mes avances',
  });
}
