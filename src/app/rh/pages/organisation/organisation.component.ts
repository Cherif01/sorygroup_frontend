import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-rh-organisation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class RhOrganisationComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Services et postes',
    subtitle: 'Structure organisationnelle.',
    icon: 'building-2',
    breadcrumb: ['Ressources humaines'],
    entityLabel: 'services et postes',
  });
}
