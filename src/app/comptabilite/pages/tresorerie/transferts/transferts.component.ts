import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-tresorerie-transferts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoTresorerieTransfertsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Transferts',
    subtitle: 'Transferts entre comptes.',
    icon: 'arrow-left-right',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'transferts',
  });
}
