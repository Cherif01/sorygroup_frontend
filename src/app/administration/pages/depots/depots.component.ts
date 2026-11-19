import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_DEPOTS } from '../../shared/data/mocks';
import { Depot } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-depots',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Dépôts"
      subtitle="Lieux de stockage et de traitement."
      [breadcrumb]="['Administration', 'Référentiels']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouveau dépôt
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="10" />
  `,
})
export class AdDepotsComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Depot[]>([...MOCK_DEPOTS]);

  protected columns: DataTableColumn<Depot>[] = [
    { key: 'code',    label: 'Code',    width: 120, minWidth: 100, sortable: true },
    { key: 'libelle', label: 'Libellé', width: 240, minWidth: 160, sortable: true, editable: true },
    { key: 'ville',   label: 'Ville',   width: 140, minWidth: 100, sortable: true },
    { key: 'responsable', label: 'Responsable', width: 180, minWidth: 140, hideOnMobile: true },
    { key: 'capacite_tonnes', label: 'Capacité', width: 120, minWidth: 100, align: 'right', sortable: true,
      format: r => `${r.capacite_tonnes} t` },
    { key: 'actif',   label: 'Statut',  width: 100, minWidth: 90,
      pill: r => r.actif ? { label: 'Actif', tone: 'ok' } : { label: 'Inactif', tone: 'off' } },
  ];

  ouvrirNouveau() {
    this.dialog.form<Partial<Depot>>({
      title: 'Nouveau dépôt',
      icon: 'warehouse',
      submitLabel: 'Créer le dépôt',
      fields: [
        { key: 'code',    label: 'Code',    type: 'text', required: true, placeholder: 'ex. DEP-LAB' },
        { key: 'libelle', label: 'Libellé', type: 'text', required: true, placeholder: 'ex. Dépôt Labé' },
        { key: 'ville',   label: 'Ville',   type: 'text', required: true },
        { key: 'responsable', label: 'Responsable', type: 'text' },
        { key: 'capacite_tonnes', label: 'Capacité', type: 'number', min: 0, unite: 't' },
        { key: 'actif',   label: 'Actif',   type: 'checkbox', cols: 1 },
      ],
      initialValues: { actif: true, capacite_tonnes: 0 },
    }).subscribe(v => {
      if (!v) return;
      const next: Depot = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        code: v.code!, libelle: v.libelle!, ville: v.ville!,
        responsable: (v.responsable as string) ?? '-',
        capacite_tonnes: Number(v.capacite_tonnes ?? 0),
        actif: !!v.actif,
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`Dépôt « ${next.libelle} » créé.`);
    });
  }
}
