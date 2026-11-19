import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MOCK_SOCIETE } from '../../shared/data/mocks';
import { Societe } from '../../shared/models/entities';

@Component({
  selector: 'app-ad-societe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, IconComponent],
  template: `
    <app-page-header
      title="Société"
      subtitle="Informations légales — reprises sur les documents émis."
      [breadcrumb]="['Administration', 'Réglages']">
      <button type="button" class="btn btn--primary" (click)="editer()">
        <app-icon name="edit" [size]="14" /> Modifier
      </button>
    </app-page-header>

    <div class="grid grid--cards">
      <div class="card">
        <h3 class="card__title">Identification</h3>
        <dl class="info">
          <div><dt>Raison sociale</dt><dd>{{ s().raison_sociale }}</dd></div>
          <div><dt>Forme juridique</dt><dd>{{ s().forme_juridique }}</dd></div>
          <div><dt>RCCM</dt><dd class="num">{{ s().rccm }}</dd></div>
          <div><dt>NIF</dt><dd class="num">{{ s().nif }}</dd></div>
        </dl>
      </div>
      <div class="card">
        <h3 class="card__title">Contact</h3>
        <dl class="info">
          <div><dt>Adresse</dt><dd>{{ s().adresse }}</dd></div>
          <div><dt>Téléphone</dt><dd>{{ s().telephone }}</dd></div>
          <div><dt>Email</dt><dd>{{ s().email }}</dd></div>
          <div><dt>Devise de tenue</dt><dd class="num">{{ s().devise_tenue }}</dd></div>
        </dl>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .info {
      display: flex; flex-direction: column; gap: var(--space-3);
      margin: 0;
    }
    .info > div {
      display: grid; grid-template-columns: 180px 1fr;
      gap: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-divider);
    }
    .info > div:last-child { border-bottom: none; padding-bottom: 0; }
    dt { color: var(--color-text-muted); font-size: var(--text-xs); }
    dd { margin: 0; font-weight: 500; color: var(--color-text); }
    @media (max-width: 640px) { .info > div { grid-template-columns: 1fr; gap: 2px; } }
  `],
})
export class AdSocieteComponent {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);

  protected readonly s = signal<Societe>({ ...MOCK_SOCIETE });

  editer() {
    this.dialog.form<Partial<Societe>>({
      title: 'Modifier la société',
      icon: 'building-2',
      submitLabel: 'Enregistrer',
      initialValues: this.s(),
      fields: [
        { key: 'raison_sociale', label: 'Raison sociale', type: 'text', required: true, cols: 1 },
        { key: 'forme_juridique', label: 'Forme juridique', type: 'text', required: true },
        { key: 'devise_tenue', label: 'Devise de tenue', type: 'select', required: true,
          options: [
            { value: 'GNF', label: 'GNF — Franc guinéen' },
            { value: 'USD', label: 'USD — Dollar US' },
            { value: 'EUR', label: 'EUR — Euro' },
          ] },
        { key: 'rccm', label: 'RCCM', type: 'text' },
        { key: 'nif',  label: 'NIF',  type: 'text' },
        { key: 'adresse',   label: 'Adresse',   type: 'textarea', cols: 1 },
        { key: 'telephone', label: 'Téléphone', type: 'tel' },
        { key: 'email',     label: 'Email',     type: 'email' },
      ],
    }).subscribe(v => {
      if (!v) return;
      this.s.update(s => ({ ...s, ...(v as Societe) }));
      this.notif.success('Informations de la société mises à jour.');
    });
  }
}
