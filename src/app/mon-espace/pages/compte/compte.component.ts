import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-me-compte',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class MeCompteComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Mon compte',
    subtitle: 'Informations de mon compte producteur.',
    icon: 'user',
    breadcrumb: ['Mon espace'],
    entityLabel: 'mon compte',
  });
}
