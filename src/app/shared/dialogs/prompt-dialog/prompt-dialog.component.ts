import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../ui/icon/icon.component';

export interface PromptDialogData {
  title?: string;
  message?: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  required?: boolean;
  multiline?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-prompt-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="sgd">
      <header class="sgd__head">
        <div class="sgd__icon"><app-icon [name]="data.icon ?? 'edit'" [size]="20" /></div>
        <div class="sgd__head-text">
          <h3 class="sgd__title">{{ data.title ?? 'Saisir une valeur' }}</h3>
          @if (data.message) {
            <p class="sgd__subtitle">{{ data.message }}</p>
          }
        </div>
        <button type="button" class="sgd__close" (click)="ref.close(null)" aria-label="Fermer">
          <app-icon name="x" [size]="18" />
        </button>
      </header>

      <div class="sgd__body">
        <div class="field">
          <label class="field__label" [class.field__label--required]="data.required">
            {{ data.label ?? 'Votre réponse' }}
          </label>
          @if (data.multiline) {
            <textarea class="field__input" rows="4"
                      [(ngModel)]="value"
                      [placeholder]="data.placeholder ?? ''"></textarea>
          } @else {
            <input class="field__input"
                   [(ngModel)]="value"
                   [placeholder]="data.placeholder ?? ''" />
          }
        </div>
      </div>

      <footer class="sgd__foot">
        <button type="button" class="btn btn--secondary" (click)="ref.close(null)">
          {{ data.cancelLabel ?? 'Annuler' }}
        </button>
        <button type="button" class="btn btn--primary"
                [disabled]="data.required && !value.trim()"
                (click)="ref.close(value.trim())">
          <app-icon name="check" [size]="14" />
          {{ data.confirmLabel ?? 'Confirmer' }}
        </button>
      </footer>
    </div>
  `,
})
export class PromptDialogComponent {
  value: string;

  constructor(
    public ref: MatDialogRef<PromptDialogComponent, string | null>,
    @Inject(MAT_DIALOG_DATA) public data: PromptDialogData,
  ) {
    this.value = data.initialValue ?? '';
  }
}
