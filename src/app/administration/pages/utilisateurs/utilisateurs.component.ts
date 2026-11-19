import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableColumn, DataTableComponent } from '../../../shared/ui/data-table/data-table.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_ROLES, MOCK_UTILISATEURS } from '../../shared/data/mocks';
import { Utilisateur } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-utilisateurs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent, IconComponent],
  template: `
    <app-page-header
      title="Utilisateurs"
      subtitle="Comptes de l'application : création, rôle, périmètre et activation."
      [breadcrumb]="['Administration', 'Accès']">
      <button type="button" class="btn btn--secondary">
        <app-icon name="download" [size]="14" /> Exporter
      </button>
      <button type="button" class="btn btn--primary" (click)="ouvrirNouveau()">
        <app-icon name="plus" [size]="14" /> Nouvel utilisateur
      </button>
    </app-page-header>

    <app-data-table
      [columns]="columns"
      [rows]="rows()"
      [selectable]="true"
      [pageSize]="10"
      (rowClick)="voir($event)" />
  `,
})
export class AdUtilisateursComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly rows = signal<Utilisateur[]>([...MOCK_UTILISATEURS]);

  protected columns: DataTableColumn<Utilisateur>[] = [
    { key: 'telephone', label: 'Téléphone', width: 130, minWidth: 110, sortable: true },
    { key: 'nom',       label: 'Nom',       width: 140, minWidth: 100, sortable: true,
      format: r => `${r.nom} ${r.prenom}` },
    { key: 'email',     label: 'Email',     width: 240, minWidth: 160, sortable: true, hideOnMobile: true },
    { key: 'role_libelle', label: 'Rôle',   width: 160, minWidth: 110, sortable: true },
    { key: 'perimetre', label: 'Périmètre', width: 180, minWidth: 120, hideOnMobile: true },
    { key: 'actif',     label: 'Statut',    width: 110, minWidth: 90,
      pill: r => r.actif
        ? { label: 'Actif',    tone: 'ok' }
        : { label: 'Inactif',  tone: 'off' } },
    { key: 'date_creation', label: 'Créé le', width: 120, minWidth: 100, sortable: true, hideOnMobile: true },
  ];

  voir(u: Utilisateur) {
    this.notif.info(`Ouverture fiche : ${u.prenom} ${u.nom}`);
  }

  ouvrirNouveau() {
    this.dialog.form<Partial<Utilisateur>>({
      title: 'Nouvel utilisateur',
      subtitle: 'Créer un compte et lui assigner un rôle.',
      icon: 'user',
      submitLabel: 'Créer le compte',
      fields: [
        { key: 'prenom',   label: 'Prénom',          type: 'text', required: true },
        { key: 'nom',      label: 'Nom',             type: 'text', required: true },
        { key: 'telephone',label: 'Téléphone',       type: 'tel',  required: true, placeholder: '620 00 00 00', hint: 'Sert aussi d\'identifiant de connexion' },
        { key: 'email',    label: 'Email',           type: 'email', required: true },
        { key: 'role_id',  label: 'Rôle',            type: 'select', required: true,
          options: MOCK_ROLES.map(r => ({ value: r.id, label: r.libelle })) },
        { key: 'perimetre', label: 'Périmètre',      type: 'text', placeholder: 'Global, Zone de…, Dépôt de…' },
        { key: 'actif',    label: 'Compte actif',    type: 'checkbox', cols: 1, hint: 'Permettre la connexion immédiate' },
      ],
      initialValues: { actif: true },
    }).subscribe(v => {
      if (!v) return;
      const next: Utilisateur = {
        id: Math.max(...this.rows().map(r => r.id)) + 1,
        nom: v.nom ?? '',
        prenom: v.prenom ?? '',
        telephone: v.telephone ?? '',
        email: v.email ?? '',
        role_id: Number(v.role_id),
        role_libelle: MOCK_ROLES.find(r => r.id === Number(v.role_id))?.libelle ?? '',
        perimetre: (v.perimetre as string) || 'Global',
        actif: !!v.actif,
        date_creation: new Date().toISOString().slice(0, 10),
      };
      this.rows.update(r => [next, ...r]);
      this.notif.success(`${next.prenom} ${next.nom} a été créé.`);
    });
  }
}
