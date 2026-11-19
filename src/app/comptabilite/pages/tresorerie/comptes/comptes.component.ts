import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-tresorerie-comptes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoTresorerieComptesComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Caisses et comptes',
    subtitle: 'Caisses et comptes bancaires.',
    icon: 'wallet',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'caisses et comptes',
  });
}
