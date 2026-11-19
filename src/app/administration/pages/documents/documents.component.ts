import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_DOCUMENTS } from '../../shared/data/mocks';
import { DocumentEmis } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-documents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Documents émis"
      subtitle="Reçus, bordereaux, factures : tout document PDF produit par le système."
      [breadcrumb]="['Administration', 'Traçabilité']">
      <button type="button" class="btn btn--secondary" (click)="verifier()">
        <app-icon name="file-check" [size]="14" /> Vérifier un document
      </button>
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="15" />
  `,
})
export class AdDocumentsComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<DocumentEmis[]>([...MOCK_DOCUMENTS]);

  protected columns: DataTableColumn<DocumentEmis>[] = [
    { key: 'numero',   label: 'Numéro',   width: 180, minWidth: 140, sortable: true },
    { key: 'type',     label: 'Type',     width: 160, minWidth: 120, sortable: true },
    { key: 'emis_le',  label: 'Émis le',  width: 160, minWidth: 130, sortable: true },
    { key: 'emis_par', label: 'Émis par', width: 180, minWidth: 140, hideOnMobile: true },
    { key: 'code_verification', label: 'Code vérif.', width: 140, minWidth: 110, hideOnMobile: true },
    { key: 'taille_ko', label: 'Taille', width: 100, minWidth: 80, align: 'right',
      format: r => `${r.taille_ko} Ko` },
  ];

  verifier() {
    this.dialog.form<{ code_verification: string }>({
      title: 'Vérifier un document',
      subtitle: 'Saisissez le code imprimé sous le QR code.',
      icon: 'file-check',
      submitLabel: 'Vérifier',
      fields: [
        { key: 'code_verification', label: 'Code de vérification', type: 'text', required: true, cols: 1, placeholder: 'ex. A7F3-K2L9' },
      ],
    }).subscribe(v => {
      if (!v) return;
      const doc = this.rows().find(d => d.code_verification.toLowerCase() === v.code_verification.toLowerCase());
      if (doc) {
        this.notif.success(`Document authentique : ${doc.numero} (${doc.type})`, 'Vérifié');
      } else {
        this.notif.error('Aucun document ne correspond à ce code.', 'Introuvable');
      }
    });
  }
}
