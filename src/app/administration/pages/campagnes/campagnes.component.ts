import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_CAMPAGNES, MOCK_PRODUITS } from '../../shared/data/mocks';
import { Campagne } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-campagnes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Campagnes"
      subtitle="Chaque campagne appartient à un produit et à une période."
      [breadcrumb]="['Administration', 'Référentiels']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouvelle campagne
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="10" />
  `,
})
export class AdCampagnesComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Campagne[]>([...MOCK_CAMPAGNES]);

  protected columns: DataTableColumn<Campagne>[] = [
    { key: 'code',    label: 'Code',    width: 120, minWidth: 100, sortable: true },
    { key: 'libelle', label: 'Libellé', width: 200, minWidth: 140, sortable: true },
    { key: 'produit_libelle', label: 'Produit', width: 140, minWidth: 100, sortable: true },
    { key: 'date_debut', label: 'Début', width: 120, minWidth: 100, sortable: true, hideOnMobile: true },
    { key: 'date_fin',   label: 'Fin',   width: 120, minWidth: 100, sortable: true, hideOnMobile: true },
    { key: 'statut',  label: 'Statut',  width: 130, minWidth: 110,
      pill: r => r.statut === 'ouverte'
        ? { label: 'Ouverte', tone: 'ok' }
        : r.statut === 'brouillon'
          ? { label: 'Brouillon', tone: 'neutral' }
          : { label: 'Fermée', tone: 'off' } },
  ];

  ouvrirNouveau() {
    this.dialog.form<Partial<Campagne>>({
      title: 'Nouvelle campagne',
      icon: 'calendar',
      submitLabel: 'Créer la campagne',
      fields: [
        { key: 'code',    label: 'Code',    type: 'text', required: true, placeholder: 'ex. CJU-2027' },
        { key: 'libelle', label: 'Libellé', type: 'text', required: true, placeholder: 'ex. Cajou 2027' },
        { key: 'produit_id', label: 'Produit', type: 'select', required: true,
          options: MOCK_PRODUITS.filter(p => p.actif).map(p => ({ value: p.id, label: p.libelle })) },
        { key: 'date_debut', label: 'Date de début', type: 'date', required: true },
        { key: 'date_fin',   label: 'Date de fin',   type: 'date', required: true },
      ],
    }).subscribe(v => {
      if (!v) return;
      const produit = MOCK_PRODUITS.find(p => p.id === Number(v.produit_id))!;
      const next: Campagne = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        code: v.code!, libelle: v.libelle!,
        produit_id: produit.id, produit_libelle: produit.libelle,
        date_debut: v.date_debut as string,
        date_fin: v.date_fin as string,
        statut: 'brouillon',
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`Campagne « ${next.libelle} » créée (brouillon).`);
    });
  }
}
