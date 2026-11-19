import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-me-champs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class MeChampsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Mes champs',
    subtitle: 'Mes parcelles cultivées.',
    icon: 'sprout',
    breadcrumb: ['Mon espace'],
    entityLabel: 'mes champs',
  });
}
