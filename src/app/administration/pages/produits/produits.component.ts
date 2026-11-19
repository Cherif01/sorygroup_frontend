import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_PRODUITS } from '../../shared/data/mocks';
import { Produit } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-produits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Produits et règles"
      subtitle="Les produits que la chaîne gère et leurs règles métier."
      [breadcrumb]="['Administration', 'Référentiels']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouveau produit
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="10" />
  `,
})
export class AdProduitsComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Produit[]>([...MOCK_PRODUITS]);

  protected columns: DataTableColumn<Produit>[] = [
    { key: 'code',    label: 'Code',    width: 100, minWidth: 80, sortable: true },
    { key: 'libelle', label: 'Libellé', width: 180, minWidth: 140, sortable: true, editable: true },
    { key: 'famille', label: 'Famille', width: 140, minWidth: 100, sortable: true },
    { key: 'unite',   label: 'Unité',   width: 100, minWidth: 80 },
    { key: 'actif',   label: 'Statut',  width: 110, minWidth: 90,
      pill: r => r.actif
        ? { label: 'Actif',   tone: 'ok' }
        : { label: 'Inactif', tone: 'off' } },
  ];

  ouvrirNouveau() {
    this.dialog.form<Partial<Produit>>({
      title: 'Nouveau produit',
      icon: 'sprout',
      submitLabel: 'Créer le produit',
      fields: [
        { key: 'code',    label: 'Code',    type: 'text', required: true, placeholder: 'ex. CJU' },
        { key: 'libelle', label: 'Libellé', type: 'text', required: true, placeholder: 'ex. Cajou' },
        { key: 'famille', label: 'Famille', type: 'select', required: true,
          options: [
            { value: 'cajou',  label: 'Cajou' },
            { value: 'cacao',  label: 'Cacao' },
            { value: 'cafe',   label: 'Café' },
            { value: 'karite', label: 'Karité' },
          ] },
        { key: 'unite',   label: 'Unité',   type: 'text', placeholder: 'kg', },
        { key: 'actif',   label: 'Actif',   type: 'checkbox', cols: 1, hint: 'Rendre le produit disponible dans les campagnes' },
      ],
      initialValues: { unite: 'kg', actif: true },
    }).subscribe(v => {
      if (!v) return;
      const next: Produit = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        code: v.code!, libelle: v.libelle!,
        famille: v.famille as Produit['famille'],
        unite: v.unite ?? 'kg',
        actif: !!v.actif,
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`Produit « ${next.libelle} » créé.`);
    });
  }
}
