import { DataTableColumn } from '../data-table/data-table.component';
import { FormField } from '../../../administration/shared/dialogs/entity-form/entity-form.types';

export interface ModulePageConfig<T extends Record<string, any> = any> {
  /** Breadcrumb (module › section › page). */
  breadcrumb?: string[];
  /** Titre de la page. */
  title: string;
  /** Sous-titre explicatif. */
  subtitle?: string;
  /** Icône du bandeau. */
  icon?: string;

  /** Colonnes du tableau. */
  columns: DataTableColumn<T>[];
  /** Jeu de données fictif initial. */
  rows: T[];
  /** Clé unique (trackBy). */
  trackByKey?: keyof T;

  /** Taille du dialog d'ajout — auto si non fourni. */
  dialogSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Icône du dialog. */
  dialogIcon?: string;
  /** Titre de l'entité au singulier (ex. "utilisateur") pour les messages. */
  entityLabel: string;
  /** Le label pour l'action "nouveau" : "Nouvel utilisateur". Par défaut Nouvel/Nouvelle + entityLabel. */
  addLabel?: string;

  /** Schéma des champs du formulaire d'ajout. Si vide, pas d'ajout. */
  fields?: FormField[];
  /** Valeurs initiales pour le formulaire d'ajout. */
  initialValues?: Record<string, any>;
  /** Construit une entité à partir des valeurs du formulaire. */
  build?: (values: Record<string, any>, maxId: number) => T;

  /** Permet le double-clic → détail. */
  detailDialog?: boolean;
  /** KPIs en haut (option). */
  kpis?: Array<{ label: string; value: string; note?: string; tone?: 'ok' | 'wait' | 'info' | 'danger' | 'neutral' }>;

  /** Fonction custom d'impression d'une ligne — si fournie, remplace l'impression générique.
   * Utile pour bulletin, contrat, facture, reçu, bordereau. */
  printRow?: (row: T) => void;
}
