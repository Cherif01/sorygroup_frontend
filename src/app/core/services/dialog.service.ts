import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { PromptDialogComponent, PromptDialogData } from '../../shared/dialogs/prompt-dialog/prompt-dialog.component';
import { EntityFormComponent } from '../../administration/shared/dialogs/entity-form/entity-form.component';
import { DialogSize, EntityFormData, FormField } from '../../administration/shared/dialogs/entity-form/entity-form.types';

/** Panels Material. Toujours `sg-dialog` + une taille. */
const panels = (size: DialogSize = 'md') => ['sg-dialog', `sg-dialog--${size}`];

/** Taille auto en fonction du nombre de champs et de leur type. */
function autoSize(fields: FormField[]): DialogSize {
  const halves = fields.filter(f => (f.cols ?? 2) === 2 && f.type !== 'textarea').length;
  const fulls = fields.length - halves;
  const effective = Math.ceil(halves / 2) + fulls;
  if (effective <= 2) return 'sm';
  if (effective <= 5) return 'md';
  if (effective <= 9) return 'lg';
  return 'xl';
}

const COMMON = {
  enterAnimationDuration: '140ms',
  exitAnimationDuration: '90ms',
  backdropClass: 'sg-backdrop',
  hasBackdrop: true,
  restoreFocus: true,
  closeOnNavigation: true,
};

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);

  /** Confirmation (ton par défaut : danger pour une suppression). */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      ...COMMON,
      data,
      panelClass: panels('sm'),
      autoFocus: false,
    }).afterClosed().pipe(map(v => v === true));
  }

  /** Raccourci : confirmation de suppression (nommée). */
  confirmDelete(name: string, details?: string): Observable<boolean> {
    return this.confirm({
      tone: 'danger',
      title: 'Supprimer définitivement ?',
      message: `Vous êtes sur le point de supprimer « ${name} ». Cette action est irréversible.`,
      details,
      confirmLabel: 'Oui, supprimer',
      cancelLabel: 'Annuler',
      icon: 'trash',
    });
  }

  /** Saisie d'un motif (annulation, refus). */
  prompt(data: PromptDialogData): Observable<string | null> {
    return this.dialog.open(PromptDialogComponent, {
      data,
      panelClass: panels('sm'),
      autoFocus: true,
      ...COMMON,
    }).afterClosed();
  }

  /** Formulaire générique. Taille auto, surchargée par `data.size`. */
  form<T = Record<string, any>>(data: EntityFormData): Observable<T | null> {
    const size = data.size ?? autoSize(data.fields);
    return this.dialog.open(EntityFormComponent, {
      data,
      panelClass: panels(size),
      autoFocus: true,
      ...COMMON,
    }).afterClosed();
  }
}
