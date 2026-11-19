import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_DEVISES } from '../../shared/data/mocks';
import { Devise } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-devises',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Devises et taux de change"
      subtitle="GNF est la devise de tenue. Les autres sont utilisées pour les ventes et dépenses."
      [breadcrumb]="['Administration', 'Réglages']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouvelle devise
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="10" />
  `,
})
export class AdDevisesComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Devise[]>([...MOCK_DEVISES]);

  protected columns: DataTableColumn<Devise>[] = [
    { key: 'code',    label: 'Code',    width: 90, minWidth: 70, sortable: true },
    { key: 'libelle', label: 'Libellé', width: 180, minWidth: 140, sortable: true },
    { key: 'symbole', label: 'Symbole', width: 90, minWidth: 70 },
    { key: 'nombre_decimales', label: 'Décimales', width: 110, minWidth: 90, align: 'right' },
    { key: 'taux_actuel', label: 'Taux actuel (en GNF)', width: 180, minWidth: 140, align: 'right', editable: true, inputType: 'number',
      format: r => r.taux_actuel.toLocaleString('fr-FR') },
    { key: 'actif',   label: 'Statut',  width: 100, minWidth: 90,
      pill: r => r.actif ? { label: 'Active', tone: 'ok' } : { label: 'Inactive', tone: 'off' } },
  ];

  ouvrirNouveau() {
    this.dialog.form<Partial<Devise>>({
      title: 'Nouvelle devise',
      icon: 'coins',
      submitLabel: 'Créer la devise',
      fields: [
        { key: 'code',    label: 'Code (ISO 4217)', type: 'text', required: true, placeholder: 'ex. GBP', hint: '3 lettres' },
        { key: 'libelle', label: 'Libellé', type: 'text', required: true, placeholder: 'ex. Livre sterling' },
        { key: 'symbole', label: 'Symbole', type: 'text', required: true, placeholder: 'ex. £' },
        { key: 'nombre_decimales', label: 'Nombre de décimales', type: 'number', required: true, min: 0, max: 4 },
        { key: 'taux_actuel', label: 'Taux initial', type: 'number', required: true, min: 0, step: 0.0001, unite: 'GNF/unité' },
        { key: 'actif',   label: 'Active', type: 'checkbox', cols: 1 },
      ],
      initialValues: { nombre_decimales: 2, actif: true },
    }).subscribe(v => {
      if (!v) return;
      const next: Devise = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        code: (v.code as string).toUpperCase(),
        libelle: v.libelle!,
        symbole: v.symbole!,
        nombre_decimales: Number(v.nombre_decimales),
        taux_actuel: Number(v.taux_actuel),
        actif: !!v.actif,
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`Devise ${next.code} ajoutée.`);
    });
  }
}
