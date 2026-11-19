import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-te-recus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class TeRecusComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Reçus de pesée',
    subtitle: 'Reçus imprimés remis aux producteurs.',
    icon: 'receipt',
    breadcrumb: ['Producteurs et collecte'],
    entityLabel: 'reçus de pesée',
  });
}
