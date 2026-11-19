import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrintService } from '../../../core/services/print.service';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';

interface Contrat {
  id: number;
  reference: string;
  type: 'CDI' | 'CDD' | 'Stage';
  nom_complet: string;
  telephone: string;
  poste: string;
  service: string;
  date_debut: string;
  date_fin?: string;
  salaire_base: number;
  periode_essai_mois: number;
  statut: string;
}

const EMPLOYES = ['Mamadou BAH', 'Aïssata DIALLO', 'Sékou CAMARA', 'Fatoumata SOW', 'Ibrahima KEITA', 'Mariama TRAORÉ'];
const POSTES = ['Directeur', 'Chef de service', 'Superviseur', 'Comptable', 'Opérateur'];
const SERVICES = ['Direction', 'Comptabilité', 'Terrain', 'Dépôt', 'Ventes'];
const TYPES: Array<'CDI' | 'CDD' | 'Stage'> = ['CDI', 'CDD', 'Stage'];

@Component({
  selector: 'app-rh-contrats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class RhContratsComponent {
  private readonly printer = inject(PrintService);

  protected readonly config: ModulePageConfig<Contrat> = {
    breadcrumb: ['Ressources humaines', 'Personnel'],
    title: 'Contrats de travail',
    subtitle: 'Contrats signés et en cours',
    icon: 'file-text',
    entityLabel: 'contrat',
    dialogSize: 'lg',
    detailDialog: true,
    kpis: [
      { label: 'Contrats actifs', value: '22', note: 'tous services', tone: 'ok' },
      { label: 'CDI',    value: '14', tone: 'info' },
      { label: 'CDD',    value: '6',  tone: 'wait' },
      { label: 'Fin ≤ 3 mois', value: '3', note: 'à renouveler', tone: 'danger' },
    ],
    columns: [
      { key: 'reference', label: 'Référence', width: 150, minWidth: 130, sortable: true },
      { key: 'nom_complet', label: 'Employé', width: 200, minWidth: 140, sortable: true },
      { key: 'type', label: 'Type', width: 90, minWidth: 70 },
      { key: 'poste', label: 'Poste', width: 180, minWidth: 140 },
      { key: 'date_debut', label: 'Début', width: 110, minWidth: 100 },
      { key: 'date_fin', label: 'Fin', width: 110, minWidth: 100,
        format: r => r.date_fin ?? 'Indéterminée' },
      { key: 'salaire_base', label: 'Salaire', width: 140, minWidth: 110, align: 'right',
        format: r => r.salaire_base.toLocaleString('fr-FR') + ' GNF' },
    ],
    fields: [
      { key: 'employe_id', label: 'Employé', type: 'select', required: true,
        options: EMPLOYES.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'type', label: 'Type de contrat', type: 'select', required: true,
        options: TYPES.map(t => ({ value: t, label: t })) },
      { key: 'date_debut', label: 'Date de prise de fonction', type: 'date', required: true },
      { key: 'date_fin', label: 'Date de fin (si CDD)', type: 'date' },
      { key: 'poste', label: 'Poste', type: 'select', required: true,
        options: POSTES.map(p => ({ value: p, label: p })) },
      { key: 'service', label: 'Service', type: 'select', required: true,
        options: SERVICES.map(s => ({ value: s, label: s })) },
      { key: 'salaire_base', label: 'Salaire brut', type: 'number', required: true, unite: 'GNF', min: 0 },
      { key: 'periode_essai_mois', label: 'Période d\'essai', type: 'number', unite: 'mois', min: 0, max: 6, placeholder: '0' },
      { key: 'clauses', label: 'Clauses particulières', type: 'textarea', cols: 1,
        placeholder: 'Mobilité géographique, confidentialité, non-concurrence…' },
    ],
    rows: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      reference: 'CT-2026-' + String(i + 20).padStart(4, '0'),
      type: TYPES[i % TYPES.length],
      nom_complet: EMPLOYES[i % EMPLOYES.length],
      telephone: '62' + String(1000000 + i * 54321).slice(0, 7),
      poste: POSTES[i % POSTES.length],
      service: SERVICES[i % SERVICES.length],
      date_debut: '2026-' + String(((i % 12) + 1)).padStart(2, '0') + '-01',
      date_fin: i % 3 === 1 ? '2026-12-31' : undefined,
      salaire_base: 2_500_000 + (i % 5) * 1_200_000,
      periode_essai_mois: (i % 4),
      statut: ['actif', 'actif', 'brouillon', 'termine'][i % 4],
    })),
    printRow: (row: Contrat) => this.printer.printContrat({
      reference: row.reference,
      employe: {
        nom_complet: row.nom_complet,
        telephone: row.telephone,
        adresse: 'Conakry, Guinée',
        piece_identite: 'CNI n° GIN-XXXX',
      },
      type_contrat: row.type,
      date_debut: row.date_debut,
      date_fin: row.date_fin,
      poste: row.poste,
      service: row.service,
      salaire_base: row.salaire_base,
      periode_essai_mois: row.periode_essai_mois,
      clauses: 'Obligation de confidentialité sur les données commerciales. Mobilité possible selon les besoins de la société.',
    }),
  };
}
