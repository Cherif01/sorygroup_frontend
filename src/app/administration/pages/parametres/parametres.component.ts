import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_PARAMETRES } from '../../shared/data/mocks';
import { Parametre } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-parametres',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Paramètres et seuils"
      subtitle="Valeurs datées : humidité max, part d'avance, taux de retenue, délais…"
      [breadcrumb]="['Administration', 'Réglages']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouvelle valeur
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="10" />
  `,
})
export class AdParametresComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Parametre[]>([...MOCK_PARAMETRES]);

  protected columns: DataTableColumn<Parametre>[] = [
    { key: 'code',    label: 'Code',    width: 200, minWidth: 140, sortable: true },
    { key: 'libelle', label: 'Libellé', width: 280, minWidth: 180, sortable: true },
    { key: 'valeur',  label: 'Valeur',  width: 100, minWidth: 80, align: 'right', editable: true, inputType: 'number' },
    { key: 'unite',   label: 'Unité',   width: 90, minWidth: 70 },
    { key: 'date_debut', label: 'En vigueur depuis', width: 150, minWidth: 110, sortable: true, hideOnMobile: true },
    { key: 'description', label: 'Description', width: 300, minWidth: 180, hideOnMobile: true },
  ];

  ouvrirNouveau() {
    this.dialog.form<Partial<Parametre>>({
      title: 'Nouvelle valeur de paramètre',
      subtitle: 'Ouvre une nouvelle valeur « à partir du… » ; l\'ancienne reste dans l\'historique.',
      icon: 'sliders',
      submitLabel: 'Enregistrer',
      fields: [
        { key: 'code',    label: 'Code',    type: 'text', required: true, placeholder: 'ex. HUMID_MAX_CACAO' },
        { key: 'libelle', label: 'Libellé', type: 'text', required: true, placeholder: 'ex. Humidité max cacao' },
        { key: 'valeur',  label: 'Valeur',  type: 'number', required: true },
        { key: 'unite',   label: 'Unité',   type: 'text', placeholder: '%, kg, jours…' },
        { key: 'date_debut', label: 'En vigueur depuis', type: 'date', required: true },
        { key: 'description', label: 'Description', type: 'textarea', cols: 1 },
      ],
      initialValues: { date_debut: new Date().toISOString().slice(0, 10) },
    }).subscribe(v => {
      if (!v) return;
      const next: Parametre = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        code: v.code!, libelle: v.libelle!,
        valeur: String(v.valeur),
        unite: (v.unite as string) ?? '',
        date_debut: v.date_debut as string,
        description: (v.description as string) ?? '',
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`Paramètre « ${next.libelle} » enregistré.`);
    });
  }
}
