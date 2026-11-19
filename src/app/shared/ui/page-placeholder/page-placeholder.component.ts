import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { DataTableComponent, DataTableColumn } from '../data-table/data-table.component';
import { IconComponent } from '../icon/icon.component';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';

interface DemoRow {
  id: number;
  code: string;
  libelle: string;
  categorie: string;
  valeur: number;
  statut: string;
  date: string;
}

/**
 * Placeholder générique pour toute page non encore implémentée.
 * Affiche l'en-tête, des KPI, un tableau éditable démo.
 */
@Component({
  selector: 'app-page-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header [title]="title()" [subtitle]="'Page de démonstration — à implémenter'">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="toast()">
        <app-icon name="plus" [size]="14" /> Nouveau
      </button>
    </app-page-header>

    <div class="grid grid--kpi stack-top">
      <div class="kpi"><div class="kpi__label">Total</div><div class="kpi__value">1 284</div><div class="kpi__note">+12% vs mois dernier</div></div>
      <div class="kpi kpi--accent"><div class="kpi__label">En attente</div><div class="kpi__value">47</div><div class="kpi__note">à traiter</div></div>
      <div class="kpi"><div class="kpi__label">Validés</div><div class="kpi__value">1 189</div><div class="kpi__note">92,6%</div></div>
      <div class="kpi"><div class="kpi__label">Taux conformité</div><div class="kpi__value">94%</div><div class="kpi__note">objectif 90%</div></div>
    </div>

    <div class="stack-top">
      <app-data-table
        [columns]="columns"
        [rows]="rows"
        [editable]="true"
        [selectable]="true"
        [pageSize]="8"
        (rowEdit)="onEdit($event)" />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .stack-top { margin-top: var(--space-5); }
  `],
})
export class PagePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(DialogService);

  protected readonly title = toSignal(
    this.route.data.pipe(map(d => (d['title'] as string) ?? 'Page')),
    { initialValue: 'Page' },
  );

  protected columns: DataTableColumn<DemoRow>[] = [
    { key: 'code', label: 'Code', width: 120, minWidth: 90, sortable: true },
    { key: 'libelle', label: 'Libellé', width: 240, minWidth: 140, sortable: true, editable: true },
    { key: 'categorie', label: 'Catégorie', width: 160, minWidth: 100, sortable: true, hideOnMobile: true },
    { key: 'valeur', label: 'Valeur', width: 140, minWidth: 100, align: 'right', sortable: true, editable: true, inputType: 'number',
      format: r => r.valeur.toLocaleString('fr-FR') },
    { key: 'statut', label: 'Statut', width: 140, minWidth: 110, sortable: true,
      pill: r => this.tone(r.statut) },
    { key: 'date', label: 'Date', width: 140, minWidth: 110, sortable: true, hideOnMobile: true },
  ];

  protected rows: DemoRow[] = [
    { id: 1, code: 'REF-001', libelle: 'Cajou brut cat. A',    categorie: 'Cajou',  valeur: 420000, statut: 'validee',  date: '2026-03-15' },
    { id: 2, code: 'REF-002', libelle: 'Cacao fermenté',       categorie: 'Cacao',  valeur: 280000, statut: 'en_attente', date: '2026-03-14' },
    { id: 3, code: 'REF-003', libelle: 'Café vert arabica',    categorie: 'Café',   valeur: 340000, statut: 'validee',  date: '2026-03-13' },
    { id: 4, code: 'REF-004', libelle: 'Karité brut',          categorie: 'Karité', valeur: 190000, statut: 'bloque',   date: '2026-03-12' },
    { id: 5, code: 'REF-005', libelle: 'Cajou brut cat. B',    categorie: 'Cajou',  valeur: 380000, statut: 'validee',  date: '2026-03-11' },
    { id: 6, code: 'REF-006', libelle: 'Cacao brut',           categorie: 'Cacao',  valeur: 260000, statut: 'en_cours', date: '2026-03-10' },
    { id: 7, code: 'REF-007', libelle: 'Noix de cajou grillé', categorie: 'Cajou',  valeur: 520000, statut: 'validee',  date: '2026-03-09' },
    { id: 8, code: 'REF-008', libelle: 'Beurre de karité',     categorie: 'Karité', valeur: 310000, statut: 'en_attente', date: '2026-03-08' },
    { id: 9, code: 'REF-009', libelle: 'Café moulu',           categorie: 'Café',   valeur: 410000, statut: 'validee',  date: '2026-03-07' },
    { id: 10, code: 'REF-010', libelle: 'Cajou cat. C',        categorie: 'Cajou',  valeur: 350000, statut: 'annulee',  date: '2026-03-06' },
    { id: 11, code: 'REF-011', libelle: 'Cacao premium',       categorie: 'Cacao',  valeur: 475000, statut: 'validee',  date: '2026-03-05' },
    { id: 12, code: 'REF-012', libelle: 'Karité raffiné',      categorie: 'Karité', valeur: 420000, statut: 'en_cours', date: '2026-03-04' },
  ];

  private tone(s: string) {
    switch (s) {
      case 'validee':    return { label: 'Validé',     tone: 'ok' as const };
      case 'en_attente': return { label: 'En attente', tone: 'wait' as const };
      case 'bloque':     return { label: 'Bloqué',     tone: 'danger' as const };
      case 'en_cours':   return { label: 'En cours',   tone: 'info' as const };
      case 'annulee':    return { label: 'Annulé',     tone: 'off' as const };
      default:           return { label: s,            tone: 'neutral' as const };
    }
  }

  protected toast() {
    this.notif.info('Démonstration : ouvrez le code pour implémenter la création.');
  }

  protected onEdit(e: any) {
    this.notif.success(`${e.column.label} modifié : ${e.oldValue} → ${e.newValue}`);
  }
}
