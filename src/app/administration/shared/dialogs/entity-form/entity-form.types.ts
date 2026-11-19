export type FieldType =
  | 'text' | 'textarea' | 'number' | 'date' | 'tel' | 'email' | 'password'
  | 'select' | 'checkbox';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  unite?: string;
  /** Largeur : 1 = pleine largeur, 2 = demi (par défaut 2) */
  cols?: 1 | 2;
  disabled?: boolean;
}

export interface EntityFormData {
  title: string;
  subtitle?: string;
  icon?: string;
  submitLabel?: string;
  cancelLabel?: string;
  fields: FormField[];
  initialValues?: Record<string, any>;
  tone?: 'primary' | 'danger';
  /** Taille forcée ; sinon calculée en fonction du nombre de champs */
  size?: DialogSize;
}
