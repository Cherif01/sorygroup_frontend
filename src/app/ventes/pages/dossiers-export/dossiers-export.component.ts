import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-ve-dossiers-export',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class VeDossiersExportComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Dossiers d\'export',
    subtitle: 'Dossiers export avec documents.',
    icon: 'ship',
    breadcrumb: ['Ventes et import-export'],
    entityLabel: 'dossiers d\'export',
  });
}
