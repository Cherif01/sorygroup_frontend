import { ChangeDetectionStrategy, Component, Inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { EntityFormData, FormField } from './entity-form.types';

@Component({
  selector: 'app-entity-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent],
  templateUrl: './entity-form.component.html',
  styleUrl: './entity-form.component.scss',
})
export class EntityFormComponent {
  protected readonly values = signal<Record<string, any>>({});
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly submitted = signal(false);

  protected readonly isValid = computed(() => {
    return this.data.fields.every(f => !f.required || !!this.values()[f.key]?.toString().trim());
  });

  constructor(
    public ref: MatDialogRef<EntityFormComponent, Record<string, any> | null>,
    @Inject(MAT_DIALOG_DATA) public data: EntityFormData,
  ) {
    const init: Record<string, any> = {};
    this.data.fields.forEach(f => {
      init[f.key] = data.initialValues?.[f.key]
        ?? (f.type === 'checkbox' ? false : f.type === 'number' ? null : '');
    });
    this.values.set(init);
  }

  setValue(key: string, value: any) {
    this.values.update(v => ({ ...v, [key]: value }));
    if (this.errors()[key]) {
      this.errors.update(e => { const { [key]: _, ...rest } = e; return rest; });
    }
  }

  cancel() { this.ref.close(null); }

  submit() {
    this.submitted.set(true);
    const errs: Record<string, string> = {};
    this.data.fields.forEach(f => {
      const v = this.values()[f.key];
      if (f.required && (v === null || v === undefined || String(v).trim() === '')) {
        errs[f.key] = 'Champ obligatoire';
      }
    });
    if (Object.keys(errs).length > 0) {
      this.errors.set(errs);
      return;
    }
    this.ref.close(this.values());
  }

  trackField = (_: number, f: FormField) => f.key;

  /** Placeholder par défaut si non fourni. */
  placeholderFor(f: FormField): string {
    if (f.placeholder) return f.placeholder;
    const label = f.label.toLowerCase();
    switch (f.type) {
      case 'email':    return 'nom@exemple.com';
      case 'tel':      return '620 00 00 00';
      case 'date':     return 'JJ/MM/AAAA';
      case 'number':   return '0';
      case 'password': return '••••••••';
      case 'textarea': return `Saisir ${label}…`;
      case 'select':   return '— Choisir —';
      case 'checkbox': return '';
      default:         return `Saisir ${label}…`;
    }
  }
}
