import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-te-carte',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class TeCarteComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Carte et zones',
    subtitle: 'Carte des producteurs et zones de collecte.',
    icon: 'map-pin',
    breadcrumb: ['Producteurs et collecte'],
    entityLabel: 'carte et zones',
  });
}
