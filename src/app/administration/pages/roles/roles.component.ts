import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_ROLES } from '../../shared/data/mocks';
import { Role } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-roles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Rôles et droits"
      subtitle="Qui a le droit de faire quoi dans l'application."
      [breadcrumb]="['Administration', 'Accès']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouveau rôle
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [rows]="rows()" [pageSize]="10" />
  `,
})
export class AdRolesComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Role[]>([...MOCK_ROLES]);

  protected columns: DataTableColumn<Role>[] = [
    { key: 'code',      label: 'Code',        width: 140, minWidth: 110, sortable: true },
    { key: 'libelle',   label: 'Libellé',     width: 180, minWidth: 140, sortable: true, editable: true },
    { key: 'description', label: 'Description', width: 320, minWidth: 180, hideOnMobile: true, editable: true },
    { key: 'nb_utilisateurs', label: 'Utilisateurs', width: 130, minWidth: 100, align: 'right', sortable: true },
    { key: 'nb_permissions',  label: 'Permissions',  width: 130, minWidth: 100, align: 'right', sortable: true },
  ];

  ouvrirNouveau() {
    this.dialog.form<Partial<Role>>({
      title: 'Nouveau rôle',
      subtitle: 'Définir un rôle et le configurer ensuite.',
      icon: 'key-round',
      submitLabel: 'Créer le rôle',
      fields: [
        { key: 'code',    label: 'Code',    type: 'text', required: true, placeholder: 'ex. comptable_adjoint', hint: 'Identifiant technique, sans espace' },
        { key: 'libelle', label: 'Libellé', type: 'text', required: true, placeholder: 'ex. Comptable adjoint' },
        { key: 'description', label: 'Description', type: 'textarea', cols: 1, placeholder: 'Rôle attribué à…' },
      ],
    }).subscribe(v => {
      if (!v) return;
      const next: Role = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        code: v.code!, libelle: v.libelle!, description: v.description ?? '',
        nb_utilisateurs: 0, nb_permissions: 0,
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`Rôle « ${next.libelle} » créé.`);
    });
  }
}
