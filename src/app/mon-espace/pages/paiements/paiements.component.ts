import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-me-paiements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class MePaiementsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Mes paiements',
    subtitle: 'Historique de mes paiements.',
    icon: 'banknote',
    breadcrumb: ['Mon espace'],
    entityLabel: 'mes paiements',
  });
}
