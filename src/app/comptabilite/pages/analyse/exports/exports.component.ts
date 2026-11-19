import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-analyse-exports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoAnalyseExportsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Exports',
    subtitle: 'Exports comptables.',
    icon: 'download',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'exports',
  });
}
