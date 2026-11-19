import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-te-rapports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class TeRapportsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Rapports',
    subtitle: 'Synthèses de collecte.',
    icon: 'file-text',
    breadcrumb: ['Producteurs et collecte'],
    entityLabel: 'rapports',
  });
}
