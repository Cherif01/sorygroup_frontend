import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IconComponent } from '../../ui/icon/icon.component';

export type ConfirmTone = 'danger' | 'wait' | 'info' | 'ok' | 'primary';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  details?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="sgd sgd--centered">
      <header class="sgd__head">
        <div class="sgd__icon" [class]="iconClass()">
          <app-icon [name]="data.icon ?? iconName()" [size]="28" />
        </div>
        <div class="sgd__head-text">
          <h3 class="sgd__title">{{ data.title ?? defaultTitle() }}</h3>
        </div>
      </header>

      <div class="sgd__body">
        <p class="sgd__message">{{ data.message }}</p>
        @if (data.details) {
          <div class="sgd__details">{{ data.details }}</div>
        }
      </div>

      <footer class="sgd__foot sgd__foot--center">
        <button type="button" class="btn btn--secondary" (click)="ref.close(false)">
          {{ data.cancelLabel ?? 'Annuler' }}
        </button>
        <button type="button" class="btn" [class]="btnClass()" (click)="ref.close(true)">
          {{ data.confirmLabel ?? defaultConfirm() }}
        </button>
      </footer>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  protected iconName(): string {
    switch (this.data.tone) {
      case 'wait': return 'alert-circle';
      case 'info': return 'info';
      case 'ok':   return 'check';
      case 'primary': return 'info';
      case 'danger':
      default:     return 'alert-triangle';
    }
  }

  protected iconClass(): string {
    switch (this.data.tone) {
      case 'wait':   return 'sgd__icon--wait';
      case 'info':   return 'sgd__icon--info';
      case 'ok':     return 'sgd__icon--ok';
      case 'danger': return 'sgd__icon--danger';
      default:       return '';
    }
  }

  protected defaultTitle(): string {
    switch (this.data.tone) {
      case 'wait': return 'Confirmation';
      case 'info': return 'Information';
      case 'ok':   return 'Confirmer';
      case 'primary': return 'Confirmer';
      case 'danger':
      default:     return 'Confirmer la suppression';
    }
  }

  protected defaultConfirm(): string {
    return this.data.tone === 'danger' ? 'Supprimer' : 'Confirmer';
  }

  protected btnClass(): string {
    return this.data.tone === 'danger' ? 'btn--danger' : 'btn--primary';
  }
}
