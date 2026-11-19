import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_AUDIT } from '../../shared/data/mocks';
import { JournalActivite } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-audit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Journal d'audit"
      subtitle="Trace de toutes les actions significatives, en lecture seule."
      [breadcrumb]="['Administration', 'Traçabilité']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows" [pageSize]="15" />
  `,
})
export class AdAuditComponent {
  protected rows: JournalActivite[] = [...MOCK_AUDIT];
  protected columns: DataTableColumn<JournalActivite>[] = [
    { key: 'date',        label: 'Date',        width: 160, minWidth: 130, sortable: true },
    { key: 'utilisateur', label: 'Utilisateur', width: 180, minWidth: 140, sortable: true },
    { key: 'action',      label: 'Action',      width: 160, minWidth: 120, sortable: true },
    { key: 'table_cible', label: 'Table',       width: 160, minWidth: 110, hideOnMobile: true },
    { key: 'ligne_id',    label: 'Ligne',       width: 100, minWidth: 80, align: 'right', hideOnMobile: true },
    { key: 'ip',          label: 'IP',          width: 140, minWidth: 100, hideOnMobile: true },
  ];
}
