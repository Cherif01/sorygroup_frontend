import { DataTableColumn } from '../data-table/data-table.component';
import { FormField } from '../../../administration/shared/dialogs/entity-form/entity-form.types';
import { ModulePageConfig } from './module-page.types';

interface DemoRow {
  id: number;
  code: string;
  libelle: string;
  date: string;
  valeur: number;
  statut: string;
  zone: string;
  responsable: string;
}

const STATUT_TONES: Record<string, { label: string; tone: any }> = {
  validee:    { label: 'Validé',     tone: 'ok' },
  en_attente: { label: 'En attente', tone: 'wait' },
  bloque:     { label: 'Bloqué',     tone: 'danger' },
  en_cours:   { label: 'En cours',   tone: 'info' },
  annulee:    { label: 'Annulé',     tone: 'off' },
};

function generateRows(label: string, count: number): DemoRow[] {
  const statuts = Object.keys(STATUT_TONES);
  const zones = ['Kolaboui', 'Kindia', 'Boké', 'Mamou', 'Labé'];
  const resp = ['M. Bah', 'A. Diallo', 'S. Camara', 'F. Sory', 'I. Keita'];
  const rows: DemoRow[] = [];
  for (let i = 1; i <= count; i++) {
    rows.push({
      id: i,
      code: label.substring(0, 3).toUpperCase() + '-' + String(i).padStart(4, '0'),
      libelle: label + ' ' + i,
      date: new Date(Date.now() - i * 86400000 * 3).toISOString().slice(0, 10),
      valeur: Math.round((Math.random() * 450000 + 50000) / 1000) * 1000,
      statut: statuts[i % statuts.length],
      zone: zones[i % zones.length],
      responsable: resp[i % resp.length],
    });
  }
  return rows;
}

const DEFAULT_COLS: DataTableColumn<DemoRow>[] = [
  { key: 'code',        label: 'Code',       width: 130, minWidth: 100, sortable: true },
  { key: 'libelle',     label: 'Libellé',    width: 240, minWidth: 140, sortable: true, editable: true },
  { key: 'zone',        label: 'Zone',       width: 140, minWidth: 100, sortable: true, hideOnMobile: true },
  { key: 'responsable', label: 'Responsable', width: 160, minWidth: 110, sortable: true, hideOnMobile: true },
  { key: 'valeur',      label: 'Valeur',     width: 140, minWidth: 100, align: 'right', sortable: true,
    format: r => r.valeur.toLocaleString('fr-FR') + ' GNF' },
  { key: 'statut',      label: 'Statut',     width: 130, minWidth: 110, sortable: true,
    pill: r => STATUT_TONES[r.statut] ?? { label: r.statut, tone: 'neutral' } },
  { key: 'date',        label: 'Date',       width: 120, minWidth: 100, sortable: true, hideOnMobile: true },
];

const DEFAULT_FIELDS: FormField[] = [
  { key: 'code',        label: 'Code',        type: 'text',   required: true },
  { key: 'libelle',     label: 'Libellé',     type: 'text',   required: true, cols: 1 },
  { key: 'zone',        label: 'Zone',        type: 'select', options: [
    { value: 'Kolaboui', label: 'Kolaboui' }, { value: 'Kindia', label: 'Kindia' },
    { value: 'Boké',     label: 'Boké' },     { value: 'Mamou',  label: 'Mamou' },
    { value: 'Labé',     label: 'Labé' },
  ] },
  { key: 'responsable', label: 'Responsable', type: 'text' },
  { key: 'valeur',      label: 'Valeur',      type: 'number', unite: 'GNF', min: 0 },
  { key: 'date',        label: 'Date',        type: 'date' },
  { key: 'statut',      label: 'Statut',      type: 'select', options: [
    { value: 'validee',    label: 'Validé' }, { value: 'en_attente', label: 'En attente' },
    { value: 'bloque',     label: 'Bloqué' }, { value: 'en_cours',   label: 'En cours' },
    { value: 'annulee',    label: 'Annulé' },
  ] },
];

/**
 * Fabrique une configuration de page générique avec données de démo.
 * On peut surcharger title/subtitle/icon/breadcrumb/entityLabel ;
 * les colonnes, les champs et les lignes sont auto-générés.
 */
export function makeDemoConfig(overrides: Partial<ModulePageConfig<DemoRow>> & {
  title: string;
  entityLabel: string;
}): ModulePageConfig<DemoRow> {
  const kpis = [
    { label: 'Total',      value: '1 248',  note: '+12%', tone: 'neutral' as const },
    { label: 'Validés',    value: '1 089',  note: '87%',  tone: 'ok' as const },
    { label: 'En attente', value: '112',    note: 'À traiter', tone: 'wait' as const },
    { label: 'Bloqués',    value: '47',     note: 'avec écart', tone: 'danger' as const },
  ];
  return {
    columns: DEFAULT_COLS,
    rows: generateRows(overrides.title, 24),
    fields: DEFAULT_FIELDS,
    detailDialog: true,
    dialogSize: 'lg',
    kpis,
    initialValues: { date: new Date().toISOString().slice(0, 10), statut: 'en_attente' },
    build: (v, maxId) => ({
      id: maxId + 1,
      code: String(v['code'] ?? 'REF-' + (maxId + 1)),
      libelle: String(v['libelle'] ?? ''),
      date: String(v['date'] ?? new Date().toISOString().slice(0, 10)),
      valeur: Number(v['valeur'] ?? 0),
      statut: String(v['statut'] ?? 'en_attente'),
      zone: String(v['zone'] ?? ''),
      responsable: String(v['responsable'] ?? ''),
    }),
    ...overrides,
  };
}
