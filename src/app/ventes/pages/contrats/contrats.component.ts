import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-ve-contrats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class VeContratsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Contrats et prix',
    subtitle: 'Contrats de vente signés.',
    icon: 'handshake',
    breadcrumb: ['Ventes et import-export'],
    entityLabel: 'contrats et prix',
  });
}
