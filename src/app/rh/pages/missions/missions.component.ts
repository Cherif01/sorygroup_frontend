import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-rh-missions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class RhMissionsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Missions',
    subtitle: 'Missions des employés.',
    icon: 'route',
    breadcrumb: ['Ressources humaines'],
    entityLabel: 'missions',
  });
}
