import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-pi-collecte-zones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class PiCollecteZonesComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Collecte par zone',
    subtitle: 'Volume collecté par zone géographique.',
    icon: 'map',
    breadcrumb: ['Pilotage'],
    entityLabel: 'collecte par zone',
  });
}
