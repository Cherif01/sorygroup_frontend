import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-co-depenses-fournisseurs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoDepensesFournisseursComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Fournisseurs',
    subtitle: 'Base fournisseurs.',
    icon: 'truck',
    breadcrumb: ['Comptabilité'],
    entityLabel: 'fournisseurs',
  });
}
