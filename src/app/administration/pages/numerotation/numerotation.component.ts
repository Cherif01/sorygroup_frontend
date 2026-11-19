import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_COMPTEURS } from '../../shared/data/mocks';
import { Compteur } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-numerotation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Numérotation"
      subtitle="Compteurs attribués aux documents et aux opérations."
      [breadcrumb]="['Administration', 'Réglages']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouveau compteur
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="10" />
  `,
})
export class AdNumerotationComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Compteur[]>([...MOCK_COMPTEURS]);

  protected columns: DataTableColumn<Compteur>[] = [
    { key: 'code',    label: 'Code',    width: 140, minWidth: 100, sortable: true },
    { key: 'libelle', label: 'Libellé', width: 180, minWidth: 140, sortable: true },
    { key: 'format',  label: 'Format',  width: 220, minWidth: 160, editable: true },
    { key: 'valeur_actuelle', label: 'Valeur actuelle', width: 150, minWidth: 110, align: 'right', sortable: true,
      format: r => r.valeur_actuelle.toLocaleString('fr-FR') },
    { key: 'reinitialisation', label: 'Réinitialisation', width: 150, minWidth: 120, hideOnMobile: true },
  ];

  ouvrirNouveau() {
    this.dialog.form<Partial<Compteur>>({
      title: 'Nouveau compteur',
      icon: 'hash',
      submitLabel: 'Créer',
      fields: [
        { key: 'code',    label: 'Code',    type: 'text', required: true },
        { key: 'libelle', label: 'Libellé', type: 'text', required: true },
        { key: 'format',  label: 'Format',  type: 'text', required: true, cols: 1, placeholder: 'ex. REF-{YYYY}-{000000}', hint: '{YYYY} = année, {000000} = numéro' },
        { key: 'valeur_actuelle', label: 'Valeur de départ', type: 'number', min: 0 },
        { key: 'reinitialisation', label: 'Réinitialisation', type: 'select', required: true,
          options: [
            { value: 'annuelle',  label: 'Annuelle' },
            { value: 'mensuelle', label: 'Mensuelle' },
            { value: 'aucune',    label: 'Aucune' },
          ] },
      ],
      initialValues: { valeur_actuelle: 0, reinitialisation: 'annuelle' },
    }).subscribe(v => {
      if (!v) return;
      const next: Compteur = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        code: v.code!, libelle: v.libelle!, format: v.format!,
        valeur_actuelle: Number(v.valeur_actuelle ?? 0),
        reinitialisation: v.reinitialisation as Compteur['reinitialisation'],
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`Compteur « ${next.libelle} » créé.`);
    });
  }
}
