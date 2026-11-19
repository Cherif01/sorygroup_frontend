import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-tresorerie-rapprochements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoTresorerieRapprochementsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Rapprochements',
    subtitle: 'Rapprochements bancaires.',
    icon: 'landmark',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'rapprochements',
  });
}
