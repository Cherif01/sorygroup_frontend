import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-ve-cout-revient',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class VeCoutRevientComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Coût de revient',
    subtitle: 'Coût de revient par lot.',
    icon: 'calculator',
    breadcrumb: ['Ventes et import-export'],
    entityLabel: 'coût de revient',
  });
}
