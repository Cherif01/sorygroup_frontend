import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';
import { makeDemoConfig } from '../../../shared/ui/module-page/demo-config';

@Component({
  selector: 'app-me-livraisons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class MeLivraisonsComponent {
  protected readonly config: ModulePageConfig = makeDemoConfig({
    title: 'Mes livraisons',
    subtitle: 'Mes pesées et livraisons.',
    icon: 'scale',
    breadcrumb: ['Mon espace'],
    entityLabel: 'mes livraisons',
  });
}
