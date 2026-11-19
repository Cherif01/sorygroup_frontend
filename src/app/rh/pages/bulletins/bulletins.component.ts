import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrintService } from '../../../core/services/print.service';
import { ModulePageComponent } from '../../../shared/ui/module-page/module-page.component';
import { ModulePageConfig } from '../../../shared/ui/module-page/module-page.types';

interface Bulletin {
  id: number;
  numero: string;
  periode: string;
  matricule: string;
  nom_complet: string;
  poste: string;
  service: string;
  salaire_base: number;
  primes: number;
  retenues: number;
  net_a_payer: number;
  statut: string;
}

const EMPLOYES = ['Mamadou BAH', 'Aïssata DIALLO', 'Sékou CAMARA', 'Fatoumata SOW', 'Ibrahima KEITA', 'Mariama TRAORÉ', 'Alpha BARRY', 'Kadiatou SYLLA'];
const POSTES = ['Directeur', 'Chef de service', 'Superviseur', 'Comptable', 'Opérateur'];
const SERVICES = ['Direction', 'Comptabilité', 'Terrain', 'Dépôt', 'Ventes'];

@Component({
  selector: 'app-rh-bulletins',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModulePageComponent],
  template: `<app-module-page [config]="config" />`,
})
export class RhBulletinsComponent {
  private readonly printer = inject(PrintService);

  protected readonly config: ModulePageConfig<Bulletin> = {
    breadcrumb: ['Ressources humaines', 'Paie'],
    title: 'Bulletins de paie',
    subtitle: 'Bulletins générés et à remettre aux employés',
    icon: 'receipt',
    entityLabel: 'bulletin',
    dialogSize: 'lg',
    detailDialog: true,
    kpis: [
      { label: 'Bulletins (mois)', value: '28', note: 'tous services', tone: 'neutral' },
      { label: 'Masse salariale', value: '142 M', note: 'GNF brut', tone: 'info' },
      { label: 'Net à payer', value: '118 M', note: 'GNF', tone: 'ok' },
      { label: 'Retenues', value: '24 M', note: 'cotisations + IRPP', tone: 'wait' },
    ],
    columns: [
      { key: 'numero', label: 'N° bulletin', width: 160, minWidth: 130, sortable: true },
      { key: 'periode', label: 'Période', width: 120, minWidth: 100, sortable: true },
      { key: 'nom_complet', label: 'Employé', width: 200, minWidth: 140, sortable: true },
      { key: 'poste', label: 'Poste', width: 160, minWidth: 120, hideOnMobile: true },
      { key: 'salaire_base', label: 'Brut', width: 140, minWidth: 110, align: 'right',
        format: r => r.salaire_base.toLocaleString('fr-FR') + ' GNF' },
      { key: 'net_a_payer', label: 'Net à payer', width: 160, minWidth: 130, align: 'right',
        format: r => r.net_a_payer.toLocaleString('fr-FR') + ' GNF' },
      { key: 'statut', label: 'Statut', width: 120, minWidth: 100,
        pill: r => ({ valide: { label: 'Validé', tone: 'ok' as const },
                      paye: { label: 'Payé', tone: 'ok' as const },
                      brouillon: { label: 'Brouillon', tone: 'neutral' as const } }[r.statut as string]
                      ?? { label: r.statut, tone: 'neutral' as const }) },
    ],
    fields: [
      { key: 'periode', label: 'Période (AAAA-MM)', type: 'text', required: true, placeholder: '2026-03' },
      { key: 'employe_id', label: 'Employé', type: 'select', required: true,
        options: EMPLOYES.map((n, i) => ({ value: i + 1, label: n })) },
      { key: 'salaire_base', label: 'Salaire de base', type: 'number', required: true, unite: 'GNF', min: 0 },
      { key: 'primes', label: 'Primes', type: 'number', unite: 'GNF', min: 0, placeholder: '0' },
      { key: 'heures_sup', label: 'Heures supp.', type: 'number', unite: 'h', min: 0, placeholder: '0' },
      { key: 'notes', label: 'Observations', type: 'textarea', cols: 1, placeholder: 'Éléments variables du mois…' },
    ],
    rows: Array.from({ length: 15 }, (_, i) => {
      const brut = 2_500_000 + (i % 5) * 1_200_000;
      const primes = Math.round(brut * 0.1);
      const retenues = Math.round((brut + primes) * 0.17);
      return {
        id: i + 1,
        numero: 'BUL-2026-' + String(i + 100).padStart(5, '0'),
        periode: '2026-' + String(((i % 3) + 1)).padStart(2, '0'),
        matricule: 'EMP-' + String((i % EMPLOYES.length) + 1).padStart(4, '0'),
        nom_complet: EMPLOYES[i % EMPLOYES.length],
        poste: POSTES[i % POSTES.length],
        service: SERVICES[i % SERVICES.length],
        salaire_base: brut,
        primes, retenues,
        net_a_payer: brut + primes - retenues,
        statut: ['valide', 'paye', 'brouillon', 'paye'][i % 4],
      };
    }),
    printRow: (row: Bulletin) => {
      const brut = row.salaire_base + row.primes;
      this.printer.printBulletin({
        reference: row.numero,
        periode: row.periode,
        employe: {
          matricule: row.matricule,
          nom_complet: row.nom_complet,
          poste: row.poste,
          service: row.service,
          date_embauche: '2022-05-15',
        },
        lignes: [
          { rubrique: 'Salaire de base',   type: 'gain',    montant: row.salaire_base },
          { rubrique: 'Prime de rendement', type: 'gain',   montant: row.primes },
          { rubrique: 'CNSS (employé)',    type: 'retenue', base: brut, taux: 2.5, montant: Math.round(brut * 0.025) },
          { rubrique: 'IRPP',              type: 'retenue', base: brut, taux: 10,  montant: Math.round(brut * 0.10) },
          { rubrique: 'Avance sur salaire', type: 'retenue', montant: Math.max(0, row.retenues - Math.round(brut * 0.125)) },
        ],
        totaux: {
          brut,
          retenues: row.retenues,
          net_a_payer: row.net_a_payer,
          cotisations_employeur: Math.round(brut * 0.18),
          devise: 'GNF',
        },
      });
    },
  };
}
