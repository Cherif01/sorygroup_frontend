import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-ve-documents-exiges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class VeDocumentsExigesComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Documents exigés',
    subtitle: 'Documents exigés par pays.',
    icon: 'list-checks',
    breadcrumb: ['Ventes et import-export'],
    entityLabel: 'documents exigés',
  });
}
