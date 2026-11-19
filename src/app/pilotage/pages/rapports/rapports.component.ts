import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-pi-rapports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class PiRapportsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Rapports',
    subtitle: 'Rapports exportables de la campagne.',
    icon: 'file-text',
    breadcrumb: ['Pilotage'],
    entityLabel: 'rapports',
  });
}
