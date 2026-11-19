import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-ve-rapports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class VeRapportsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Rapports',
    subtitle: 'Rapports commerciaux.',
    icon: 'file-text',
    breadcrumb: ['Ventes et import-export'],
    entityLabel: 'rapports',
  });
}
