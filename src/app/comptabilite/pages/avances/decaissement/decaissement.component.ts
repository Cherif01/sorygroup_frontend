import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrintService } from '../../../../core/services/print.service';
import { ModulePageComponent } from '../../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../../shared/ui/module-page/module-page.types';

interface Decaissement {
  id: number;
  reference: string;
  date: string;
  producteur: string;
  montant: number;
  compte: string;
  mode: string;
  reference_ext?: string;
  motif: string;
  responsable: string;
  statut: string;
}

const PRODUCTEURS = ['Mamadou BAH', 'Aïssata DIALLO', 'Sékou CAMARA', 'Fatoumata SOW', 'Ibrahima KEITA'];
const COMPTES = ['Caisse Kindia', 'Caisse Boké', 'Banque BICIGUI 00123', 'Orange Money +224 620…'];
const MODES = ['Espèces', 'Orange Money', 'Virement bancaire', 'Chèque'];
const MOTIFS = ['Préparation du champ', 'Main d\'œuvre', 'Intrants', 'Besoin personnel', 'Matériel'];

@Component({
  selector: 'app-co-avances-decaissement',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class CoAvancesDecaissementComponent {
  private readonly printer = inject(PrintService);

  protected readonly config: ModulePageConfig<Decaissement> = {
    breadcrumb: ['Comptabilité', 'Avances aux producteurs'],
    title: 'Décaissement des avances',
    subtitle: 'Avances validées à verser aux producteurs — chaque versement génère un reçu imprimable.',
    icon: 'banknote',
    entityLabel: 'versement',
    dialogSize: 'lg',
    detailDialog: true,
    kpis: [
      { label: 'À verser',       value: '8',     note: 'avances validées', tone: 'wait' },
      { label: 'Versé (semaine)', value: '12',   note: '14,5 M GNF', tone: 'ok' },
      { label: 'Montant total',  value: '142 M', note: 'en cours', tone: 'info' },
      { label: 'Refus',          value: '2',     note: 'justification', tone: 'danger' },
    ],
    columns: [
      { key: 'reference', label: 'Référence', width: 160, minWidth: 130, sortable: true },
      { key: 'date', label: 'Date versement', width: 130, minWidth: 110, sortable: true },
      { key: 'producteur', label: 'Producteur', width: 200, minWidth: 140 },
      { key: 'montant', label: 'Montant', width: 160, minWidth: 130, align: 'right',
        format: r => r.montant.toLocaleString('fr-FR') + ' GNF' },
      { key: 'mode', label: 'Mode', width: 150, minWidth: 110 },
      { key: 'compte', label: 'Compte émetteur', width: 200, minWidth: 140, hideOnMobile: true },
      { key: 'statut', label: 'Statut', width: 120, minWidth: 100,
        pill: r => ({ verse: { label: 'Versé', tone: 'ok' as const },
                      en_attente: { label: 'À verser', tone: 'wait' as const },
                      refuse: { label: 'Refusé', tone: 'danger' as const } }[r.statut as string]
                      ?? { label: r.statut, tone: 'neutral' as const }) },
    ],
    fields: [
      { key: 'avance_id', label: 'Avance validée', type: 'select', required: true,
        placeholder: 'Sélectionner une avance à verser',
        options: Array.from({ length: 8 }, (_, i) => ({
          value: i + 1, label: 'AV-2026-' + String(i + 100).padStart(6, '0') + ' — ' + PRODUCTEURS[i % PRODUCTEURS.length],
        })) },
      { key: 'date', label: 'Date du versement', type: 'date', required: true },
      { key: 'montant', label: 'Montant versé', type: 'number', required: true, unite: 'GNF', min: 0, placeholder: '0' },
      { key: 'compte', label: 'Compte émetteur', type: 'select', required: true,
        options: COMPTES.map(c => ({ value: c, label: c })) },
      { key: 'mode', label: 'Mode de paiement', type: 'select', required: true,
        options: MODES.map(m => ({ value: m, label: m })) },
      { key: 'reference_ext', label: 'Référence externe', type: 'text',
        placeholder: 'ID Orange Money, numéro de chèque…', hint: 'Référence du support de paiement' },
      { key: 'commentaire', label: 'Commentaire', type: 'textarea', cols: 1,
        placeholder: 'Conditions particulières du versement…' },
    ],
    rows: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      reference: 'VER-2026-' + String(i + 50).padStart(6, '0'),
      date: new Date(Date.now() - i * 86400000 * 2).toISOString().slice(0, 10),
      producteur: PRODUCTEURS[i % PRODUCTEURS.length],
      montant: [250000, 500000, 750000, 1000000, 1500000, 2000000][i % 6],
      compte: COMPTES[i % COMPTES.length],
      mode: MODES[i % MODES.length],
      reference_ext: 'TRX-' + String(100000 + i * 7).slice(0, 8),
      motif: MOTIFS[i % MOTIFS.length],
      responsable: 'Aïssata DIALLO',
      statut: ['verse', 'en_attente', 'verse', 'verse'][i % 4],
    })),
    printRow: (row: Decaissement) => this.printer.printRecu({
      type: 'avance',
      reference: row.reference,
      date: row.date,
      de: row.compte,
      vers: row.producteur,
      montant: row.montant,
      devise: 'GNF',
      mode: row.mode,
      reference_externe: row.reference_ext,
      motif: row.motif,
      responsable: row.responsable,
    }),
  };
}
