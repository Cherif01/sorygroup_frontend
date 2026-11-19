import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_CONNEXIONS } from '../../shared/data/mocks';
import { Connexion } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-connexions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Connexions"
      subtitle="Historique des tentatives de connexion — succès et échecs."
      [breadcrumb]="['Administration', 'Traçabilité']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows" [pageSize]="15" />
  `,
})
export class AdConnexionsComponent {
  protected rows: Connexion[] = [...MOCK_CONNEXIONS];
  protected columns: DataTableColumn<Connexion>[] = [
    { key: 'date',        label: 'Date',        width: 160, minWidth: 130, sortable: true },
    { key: 'utilisateur', label: 'Utilisateur', width: 180, minWidth: 140, sortable: true },
    { key: 'telephone',   label: 'Téléphone',   width: 130, minWidth: 110, hideOnMobile: true },
    { key: 'succes',      label: 'Résultat',    width: 120, minWidth: 100,
      pill: r => r.succes
        ? { label: 'Succès', tone: 'ok' }
        : { label: 'Échec',  tone: 'danger' } },
    { key: 'ip',          label: 'IP',          width: 140, minWidth: 100, hideOnMobile: true },
    { key: 'appareil',    label: 'Appareil',    width: 200, minWidth: 140, hideOnMobile: true },
  ];
}
