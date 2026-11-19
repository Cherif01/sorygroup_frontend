import { ChangeDetectionStrategy, Component } from '@angular/core';
import { configFromSchema } from '../../../shared/ui/module-page/action-schemas';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';

@Component({
  selector: 'app-rh-conges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class RhCongesComponent {
  protected readonly config: ModulePageConfig = configFromSchema('rh/conges')!;
}
