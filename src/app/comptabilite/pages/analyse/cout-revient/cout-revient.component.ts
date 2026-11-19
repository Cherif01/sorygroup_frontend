import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-analyse-cout-revient',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoAnalyseCoutRevientComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Coût de revient',
    subtitle: 'Analyse du coût de revient.',
    icon: 'calculator',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'coût de revient',
  });
}
