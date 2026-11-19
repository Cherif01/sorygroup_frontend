import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-pi-approbations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class PiApprobationsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Approbations',
    subtitle: 'Décisions en attente de validation.',
    icon: 'stamp',
    breadcrumb: ['Pilotage'],
    entityLabel: 'approbations',
  });
}
