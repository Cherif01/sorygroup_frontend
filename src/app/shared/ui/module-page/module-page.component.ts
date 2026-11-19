import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { APP_NAME } from '../../../config';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PrintService } from '../../../core/services/print.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { IconComponent } from '../icon/icon.component';
import { ModulePageConfig } from './module-page.types';

/**
 * Composant générique de page de module.
 * Affiche l'en-tête (avec logo), les KPIs, le tableau et gère les dialogs
 * (ajout + détail) à partir d'une configuration unique.
 */
@Component({
  selector: 'app-module-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, IconComponent],
  templateUrl: './module-page.component.html',
  styleUrl: './module-page.component.scss',
})
export class ModulePageComponent<T extends Record<string, any> = any> {
  private readonly dialog = inject(DialogService);
  private readonly notif = inject(NotificationService);
  private readonly printer = inject(PrintService);

  readonly config = input.required<ModulePageConfig<T>>();

  protected readonly appName = APP_NAME;
  protected readonly rows = signal<T[]>([]);

  protected readonly breadcrumb = computed(() => this.config().breadcrumb ?? []);

  constructor() {
    // Re-synchronise les lignes dès que la config (input) change :
    // ex. navigation entre deux pages du même module, l'ancien
    // composant est détruit mais si Angular réutilise l'instance
    // de ModulePageComponent, l'effet suit l'input signal.
    effect(() => {
      const cfg = this.config();
      this.rows.set([...cfg.rows]);
    });
  }

  protected addLabel = computed(() => {
    const cfg = this.config();
    if (cfg.addLabel) return cfg.addLabel;
    const first = cfg.entityLabel.toLowerCase();
    const vowel = /^[aeiouyàâéèêîôù]/.test(first);
    return (vowel ? 'Nouvel ' : 'Nouveau ') + first;
  });

  openAdd() {
    const cfg = this.config();
    if (!cfg.fields || cfg.fields.length === 0) {
      this.notif.info("La saisie n'est pas disponible pour cet écran.");
      return;
    }
    this.dialog.form<Record<string, any>>({
      title: this.addLabel(),
      subtitle: `Enregistrer ${cfg.entityLabel.toLowerCase()} dans ${this.appName}`,
      icon: cfg.dialogIcon ?? cfg.icon ?? 'plus',
      submitLabel: 'Enregistrer',
      fields: cfg.fields,
      initialValues: cfg.initialValues,
      size: cfg.dialogSize,
    }).subscribe(v => {
      if (!v) return;
      const maxId = Math.max(0, ...this.rows().map(r => Number(r['id'] ?? 0)));
      const entity = cfg.build ? cfg.build(v, maxId) : ({ id: maxId + 1, ...v } as unknown as T);
      this.rows.update(list => [entity, ...list]);
      this.notif.success(`${cfg.entityLabel} enregistré${cfg.entityLabel.endsWith('e') ? '' : ''}.`);
    });
  }

  openDetail(row: T) {
    const cfg = this.config();
    if (!cfg.detailDialog) return;
    // Détail en lecture : on utilise le même schéma de champs, désactivés.
    const detailFields = (cfg.fields ?? cfg.columns.map(c => ({
      key: c.key as string, label: c.label, type: 'text' as const, disabled: true,
    }))).map(f => ({ ...f, disabled: true, required: false }));

    this.dialog.form({
      title: `Détail — ${cfg.entityLabel}`,
      subtitle: cfg.columns[0] ? String(row[cfg.columns[0].key as keyof T] ?? '') : '',
      icon: cfg.dialogIcon ?? cfg.icon ?? 'eye',
      fields: detailFields,
      initialValues: row as Record<string, any>,
      submitLabel: 'Imprimer la fiche',
      cancelLabel: 'Fermer',
      size: cfg.dialogSize,
    }).subscribe(result => {
      if (result) this.imprimerFiche(row);
    });
  }

  exporter() {
    this.notif.info('Export CSV à implémenter côté API.');
  }

  /** Modifier une ligne. */
  openEdit(row: T) {
    const cfg = this.config();
    if (!cfg.fields || cfg.fields.length === 0) {
      this.notif.info("L'édition n'est pas disponible ici.");
      return;
    }
    this.dialog.form<Record<string, any>>({
      title: `Modifier ${cfg.entityLabel.toLowerCase()}`,
      subtitle: 'Mettre à jour les informations',
      icon: 'edit',
      submitLabel: 'Enregistrer',
      fields: cfg.fields,
      initialValues: row as Record<string, any>,
      size: cfg.dialogSize,
    }).subscribe(v => {
      if (!v) return;
      const key = String(cfg.trackByKey ?? 'id');
      this.rows.update(list => list.map(r => (r as any)[key] === (row as any)[key] ? { ...r, ...v } as T : r));
      this.notif.success(`${cfg.entityLabel} modifié.`);
    });
  }

  /** Supprimer une ligne. */
  supprimer(row: T) {
    const cfg = this.config();
    const titleCol = cfg.columns.find(c => c.key === 'libelle' || c.key === 'nom_complet' || c.key === 'numero') ?? cfg.columns[0];
    const name = titleCol ? String(row[titleCol.key as string] ?? '') : cfg.entityLabel;
    this.dialog.confirmDelete(name).subscribe(ok => {
      if (!ok) return;
      const key = String(cfg.trackByKey ?? 'id');
      this.rows.update(list => list.filter(r => (r as any)[key] !== (row as any)[key]));
      this.notif.success(`${cfg.entityLabel} supprimé.`);
    });
  }

  /** Imprime la liste courante (rapport A4 paysage). */
  imprimerListe() {
    const cfg = this.config();
    const cols = cfg.columns.map(c => ({
      key: c.key as string,
      label: c.label,
      align: c.align,
      format: c.format ? (r: any) => c.format!(r) : undefined,
    }));
    this.printer.printTable({
      title: cfg.title,
      subtitle: cfg.subtitle ?? `Liste ${cfg.entityLabel.toLowerCase()} — ${this.rows().length} lignes`,
      columns: cols,
      rows: this.rows(),
    });
  }

  /** Imprime une fiche (ligne) en A4 portrait. Utilise `printRow` custom si fourni. */
  imprimerFiche(row: T) {
    const cfg = this.config();
    if (cfg.printRow) { cfg.printRow(row); return; }
    const fields = cfg.columns.map(c => ({
      label: c.label,
      value: c.format ? c.format(row) : (row[c.key as string] as any),
    }));
    const titleCol = cfg.columns.find(c => c.key === 'libelle' || c.key === 'nom_complet' || c.key === 'numero') ?? cfg.columns[0];
    const subtitle = titleCol ? String(row[titleCol.key as string] ?? '') : '';
    const refCol = cfg.columns.find(c => c.key === 'numero' || c.key === 'code' || c.key === 'matricule');
    const reference = refCol ? String(row[refCol.key as string] ?? '') : undefined;
    this.printer.printFiche({
      entityLabel: cfg.entityLabel,
      reference,
      title: `${cfg.entityLabel.charAt(0).toUpperCase() + cfg.entityLabel.slice(1)} — ${subtitle}`,
      subtitle: cfg.title,
      fields,
    });
  }
}
