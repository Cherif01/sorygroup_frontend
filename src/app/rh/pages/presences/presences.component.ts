import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-rh-presences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class RhPresencesComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Présences',
    subtitle: 'Présences quotidiennes.',
    icon: 'calendar-check',
    breadcrumb: ['Ressources humaines'],
    entityLabel: 'présences',
  });
}
