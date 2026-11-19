import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-ve-encaissements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class VeEncaissementsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Encaissements',
    subtitle: 'Encaissements clients.',
    icon: 'hand-coins',
    breadcrumb: ['Ventes et import-export'],
    entityLabel: 'encaissements',
  });
}
