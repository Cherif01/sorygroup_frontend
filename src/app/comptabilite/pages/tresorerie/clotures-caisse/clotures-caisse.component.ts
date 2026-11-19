import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-tresorerie-clotures-caisse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoTresorerieCloturesCaisseComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Clôtures caisse',
    subtitle: 'Clôtures quotidiennes.',
    icon: 'lock',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'clôtures caisse',
  });
}
