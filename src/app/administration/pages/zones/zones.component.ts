import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_ZONES } from '../../shared/data/mocks';
import { Zone } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-zones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Zones"
      subtitle="Découpage territorial — un superviseur est rattaché à une ou plusieurs zones."
      [breadcrumb]="['Administration', 'Référentiels']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouvelle zone
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="10" />
  `,
})
export class AdZonesComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Zone[]>([...MOCK_ZONES]);

  protected columns: DataTableColumn<Zone>[] = [
    { key: 'code',    label: 'Code',    width: 100, minWidth: 80, sortable: true },
    { key: 'libelle', label: 'Libellé', width: 200, minWidth: 140, sortable: true, editable: true },
    { key: 'zone_parent_id', label: 'Zone parent', width: 140, minWidth: 100,
      format: r => r.zone_parent_id ? MOCK_ZONES.find(z => z.id === r.zone_parent_id)?.libelle ?? '-' : '—' },
    { key: 'nb_producteurs', label: 'Producteurs', width: 130, minWidth: 100, align: 'right', sortable: true },
    { key: 'actif',   label: 'Statut',  width: 100, minWidth: 90,
      pill: r => r.actif
        ? { label: 'Active',   tone: 'ok' }
        : { label: 'Inactive', tone: 'off' } },
  ];

  ouvrirNouveau() {
    this.dialog.form<Partial<Zone>>({
      title: 'Nouvelle zone',
      icon: 'map-pin',
      submitLabel: 'Créer la zone',
      fields: [
        { key: 'code',    label: 'Code',    type: 'text', required: true, placeholder: 'ex. KOL-02' },
        { key: 'libelle', label: 'Libellé', type: 'text', required: true, placeholder: 'ex. Kolaboui Nord' },
        { key: 'zone_parent_id', label: 'Zone parent', type: 'select',
          options: [{ value: '', label: '— Aucune —' }, ...MOCK_ZONES.filter(z => z.zone_parent_id === null).map(z => ({ value: z.id, label: z.libelle }))] },
        { key: 'actif',   label: 'Active', type: 'checkbox', cols: 1 },
      ],
      initialValues: { actif: true },
    }).subscribe(v => {
      if (!v) return;
      const next: Zone = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        code: v.code!, libelle: v.libelle!,
        zone_parent_id: v.zone_parent_id ? Number(v.zone_parent_id) : null,
        nb_producteurs: 0, actif: !!v.actif,
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`Zone « ${next.libelle} » créée.`);
    });
  }
}
