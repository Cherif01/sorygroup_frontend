import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrintService } from '../../../../core/services/print.service';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';

interface Operation {
  id: number; reference: string; date: string;
  beneficiaire: string; montant: number;
  compte: string; mode: string; reference_ext?: string;
  motif: string; responsable: string; statut: string;
}

const BENS = ['Sylla Transport', 'Camara Négoce', 'Fournitures Boké SA', 'TotalEnergies Guinée', 'BICIGUI'];
const COMPTES = ['Caisse Kindia', 'Banque BICIGUI 00123', 'Orange Money', 'Caisse Boké'];
const MODES = ['Espèces', 'Orange Money', 'Virement bancaire', 'Chèque'];

@Component({
  selector: 'app-co-depenses-reglements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoDepensesReglementsComponent {
  private readonly printer = inject(PrintService);

  protected readonly config: ModulePageConfig<Operation> = {
    breadcrumb: ['Comptabilité', 'Dépenses'],
    title: 'Règlements des dépenses',
    subtitle: 'Paiement des fournisseurs — chaque règlement génère un reçu imprimable.',
    icon: 'banknote',
    entityLabel: 'règlement',
    dialogSize: 'lg',
    detailDialog: true,
    kpis: [
      { label: 'À régler',       value: '14', note: 'en attente', tone: 'wait' as const },
      { label: 'Réglé (mois)',   value: '38', note: 'opérations', tone: 'ok' as const },
      { label: 'Montant mois',   value: '68 M', note: 'GNF', tone: 'info' as const },
      { label: 'Écarts',         value: '1', note: 'à vérifier', tone: 'danger' as const },
    ],
    columns: [
      { key: 'reference', label: 'Référence', width: 160, minWidth: 130, sortable: true },
      { key: 'date',      label: 'Date',      width: 120, minWidth: 100, sortable: true },
      { key: 'beneficiaire', label: 'Bénéficiaire', width: 220, minWidth: 160 },
      { key: 'montant',   label: 'Montant',   width: 160, minWidth: 130, align: 'right' as const,
        format: (r: Operation) => r.montant.toLocaleString('fr-FR') + ' GNF' },
      { key: 'mode',      label: 'Mode',      width: 140, minWidth: 110 },
      { key: 'compte',    label: 'Compte',    width: 200, minWidth: 140, hideOnMobile: true },
      { key: 'statut',    label: 'Statut',    width: 120, minWidth: 100,
        pill: (r: Operation) => (({ regle: { label: 'Réglé',      tone: 'ok' as const },
                    en_attente: { label: 'En attente', tone: 'wait' as const },
                    annule: { label: 'Annulé',     tone: 'off' as const } } as Record<string, { label: string; tone: 'ok' | 'wait' | 'off' | 'neutral' }>)[r.statut] ?? { label: r.statut, tone: 'neutral' as const }) },
    ],
    fields: [
      { key: 'beneficiaire', label: 'Bénéficiaire', type: 'select' as const, required: true,
        options: BENS.map((n: string) => ({ value: n, label: n })) },
      { key: 'date', label: 'Date', type: 'date' as const, required: true },
      { key: 'montant', label: 'Montant', type: 'number' as const, required: true, unite: 'GNF', min: 0, placeholder: '0' },
      { key: 'compte', label: 'Compte', type: 'select' as const, required: true,
        options: COMPTES.map((c: string) => ({ value: c, label: c })) },
      { key: 'mode', label: 'Mode', type: 'select' as const, required: true,
        options: MODES.map((m: string) => ({ value: m, label: m })) },
      { key: 'reference_ext', label: 'Référence externe', type: 'text' as const,
        placeholder: 'N° de transaction, chèque, bordereau…' },
      { key: 'motif', label: 'Motif', type: 'textarea' as const, cols: 1 as const, required: true,
        placeholder: 'Décrivez l\'objet de l\'opération.' },
    ],
    rows: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      reference: 'OP-2026-' + String(i + 100).padStart(6, '0'),
      date: new Date(Date.now() - i * 86400000 * 2).toISOString().slice(0, 10),
      beneficiaire: BENS[i % BENS.length],
      montant: [250000, 500000, 1200000, 2500000, 4800000, 8000000][i % 6],
      compte: COMPTES[i % COMPTES.length],
      mode: MODES[i % MODES.length],
      reference_ext: 'TRX-' + String(200000 + i * 13).slice(0, 8),
      motif: 'Règlement dépense',
      responsable: 'Aïssata DIALLO',
      statut: ['regle', 'en_attente', 'regle', 'regle'][i % 4],
    })),
    printRow: (row: Operation) => this.printer.printRecu({
      type: 'reglement',
      reference: row.reference,
      date: row.date,
      de: row.compte,
      vers: row.beneficiaire,
      montant: row.montant,
      devise: 'GNF',
      mode: row.mode,
      reference_externe: row.reference_ext,
      motif: row.motif,
      responsable: row.responsable,
    }),
  };
}
