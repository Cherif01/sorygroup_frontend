import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-analyse-resultat-campagne',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoAnalyseResultatCampagneComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Résultat campagne',
    subtitle: 'Résultat de la campagne.',
    icon: 'chart-column',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'résultat campagne',
  });
}
