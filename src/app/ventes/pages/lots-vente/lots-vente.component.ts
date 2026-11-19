import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-ve-lots-vente',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class VeLotsVenteComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Lots de vente',
    subtitle: 'Lots agrégés prêts à vendre.',
    icon: 'package-check',
    breadcrumb: ['Ventes et import-export'],
    entityLabel: 'lots de vente',
  });
}
