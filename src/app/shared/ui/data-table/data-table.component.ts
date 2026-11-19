import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, computed, input, model, output, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from '../icon/icon.component';

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  /** Largeur initiale en px */
  width?: number;
  /** Largeur minimale pendant le resize */
  minWidth?: number;
  /** Tri activé */
  sortable?: boolean;
  /** Édition en place */
  editable?: boolean;
  /** Alignement */
  align?: 'left' | 'center' | 'right';
  /** Formatage de la valeur */
  format?: (row: T) => string;
  /** Accesseur de la valeur brute */
  value?: (row: T) => any;
  /** Clé de la pastille (optionnel) */
  pill?: (row: T) => { label: string; tone: 'neutral' | 'info' | 'wait' | 'ok' | 'danger' | 'off' } | null;
  /** Masque la colonne (gérée par le picker de colonnes) */
  hidden?: boolean;
  /** Masque sur mobile */
  hideOnMobile?: boolean;
  /** Type d'input pour l'édition */
  inputType?: 'text' | 'number' | 'date';
}

export interface EditEvent<T = any> {
  row: T;
  column: DataTableColumn<T>;
  oldValue: any;
  newValue: any;
}

@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatMenuModule, IconComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T extends Record<string, any> = any> {
  /** Colonnes du tableau */
  readonly columns = model.required<DataTableColumn<T>[]>();
  /** Lignes */
  readonly rows = input.required<T[]>();
  /** Identifiant unique de ligne (pour trackBy et tri) */
  readonly trackByKey = input<keyof T>('id' as keyof T);
  /** Sélection activée */
  readonly selectable = input<boolean>(false);
  /** Édition globale activée */
  readonly editable = input<boolean>(false);
  /** Activer la recherche */
  readonly searchable = input<boolean>(true);
  /** Activer le picker de colonnes */
  readonly columnPicker = input<boolean>(true);
  /** Texte vide */
  readonly emptyText = input<string>('Aucune donnée à afficher');
  /** Pagination : taille de page (0 = pas de pagination) */
  readonly pageSize = input<number>(10);

  /** Active la colonne Actions (mat-menu par ligne). */
  readonly showActions = input<boolean>(true);

  readonly rowEdit = output<EditEvent<T>>();
  readonly rowClick = output<T>();
  readonly selectionChange = output<T[]>();
  readonly rowView = output<T>();
  readonly rowPrint = output<T>();
  readonly rowEditAction = output<T>();
  readonly rowDelete = output<T>();

  protected readonly search = signal<string>('');
  protected readonly sortCol = signal<string | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');
  protected readonly selected = signal<Set<any>>(new Set());
  protected readonly editing = signal<{ row: T; col: DataTableColumn<T>; value: any } | null>(null);
  protected readonly page = signal<number>(1);
  protected readonly columnMenuOpen = signal(false);

  protected readonly visibleColumns = computed(() => this.columns().filter(c => !c.hidden));

  protected readonly filteredRows = computed<T[]>(() => {
    const q = this.search().trim().toLowerCase();
    let data = this.rows();
    if (q) {
      data = data.filter(row =>
        this.visibleColumns().some(col => String(this.getValue(row, col)).toLowerCase().includes(q))
      );
    }
    const key = this.sortCol();
    if (key) {
      const col = this.columns().find(c => c.key === key);
      if (col) {
        const dir = this.sortDir() === 'asc' ? 1 : -1;
        data = [...data].sort((a, b) => {
          const va = this.getValue(a, col);
          const vb = this.getValue(b, col);
          if (va == null) return 1; if (vb == null) return -1;
          if (va < vb) return -1 * dir;
          if (va > vb) return 1 * dir;
          return 0;
        });
      }
    }
    return data;
  });

  protected readonly pagedRows = computed<T[]>(() => {
    const size = this.pageSize();
    if (!size) return this.filteredRows();
    const start = (this.page() - 1) * size;
    return this.filteredRows().slice(start, start + size);
  });

  protected readonly totalPages = computed(() => {
    const size = this.pageSize();
    if (!size) return 1;
    return Math.max(1, Math.ceil(this.filteredRows().length / size));
  });

  // --------------- Tri ---------------
  protected sort(col: DataTableColumn<T>) {
    if (!col.sortable) return;
    if (this.sortCol() === col.key) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col.key);
      this.sortDir.set('asc');
    }
  }

  // --------------- Sélection ---------------
  protected toggleRow(row: T) {
    const key = row[this.trackByKey()];
    const next = new Set(this.selected());
    if (next.has(key)) next.delete(key); else next.add(key);
    this.selected.set(next);
    this.emitSelection();
  }
  protected toggleAll() {
    const all = this.pagedRows();
    const next = new Set<any>();
    const current = this.selected();
    const allSelected = all.every(r => current.has(r[this.trackByKey()]));
    if (!allSelected) all.forEach(r => next.add(r[this.trackByKey()]));
    this.selected.set(next);
    this.emitSelection();
  }
  protected isSelected(row: T): boolean { return this.selected().has(row[this.trackByKey()]); }
  protected isAllSelected = computed(() => {
    const paged = this.pagedRows();
    return paged.length > 0 && paged.every(r => this.selected().has(r[this.trackByKey()]));
  });
  private emitSelection() {
    const map = new Map(this.rows().map(r => [r[this.trackByKey()], r]));
    const picks: T[] = [];
    this.selected().forEach(k => { const r = map.get(k); if (r) picks.push(r); });
    this.selectionChange.emit(picks);
  }

  // --------------- Édition ---------------
  protected startEdit(row: T, col: DataTableColumn<T>, ev: MouseEvent) {
    if (!this.editable() || !col.editable) return;
    ev.stopPropagation();
    this.editing.set({ row, col, value: this.getValue(row, col) });
  }
  protected commitEdit() {
    const e = this.editing();
    if (!e) return;
    const oldValue = this.getValue(e.row, e.col);
    if (oldValue !== e.value) {
      this.rowEdit.emit({ row: e.row, column: e.col, oldValue, newValue: e.value });
      (e.row as any)[e.col.key] = e.value;
    }
    this.editing.set(null);
  }
  protected cancelEdit() { this.editing.set(null); }
  protected onEditKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter') this.commitEdit();
    if (ev.key === 'Escape') this.cancelEdit();
  }

  // --------------- Redimensionnement des colonnes ---------------
  private resizing: { col: DataTableColumn<T>; startX: number; startW: number } | null = null;

  protected startResize(ev: MouseEvent, col: DataTableColumn<T>) {
    ev.preventDefault();
    ev.stopPropagation();
    const th = (ev.target as HTMLElement).closest('th') as HTMLTableCellElement;
    if (!th) return;
    this.resizing = { col, startX: ev.clientX, startW: th.offsetWidth };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (e: MouseEvent) => {
      if (!this.resizing) return;
      const dx = e.clientX - this.resizing.startX;
      const min = this.resizing.col.minWidth ?? 60;
      const next = Math.max(min, this.resizing.startW + dx);
      this.updateColumnWidth(this.resizing.col.key, next);
    };
    const onUp = () => {
      this.resizing = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private updateColumnWidth(key: string, width: number) {
    this.columns.update(cols => cols.map(c => c.key === key ? { ...c, width } : c));
  }

  // --------------- Picker de colonnes ---------------
  protected toggleColumnMenu() { this.columnMenuOpen.update(v => !v); }
  protected toggleColumnVisible(col: DataTableColumn<T>) {
    this.columns.update(cols => cols.map(c => c.key === col.key ? { ...c, hidden: !c.hidden } : c));
  }

  // --------------- Pagination ---------------
  protected prevPage() { this.page.update(p => Math.max(1, p - 1)); }
  protected nextPage() { this.page.update(p => Math.min(this.totalPages(), p + 1)); }
  protected goToPage(p: number) { this.page.set(Math.max(1, Math.min(this.totalPages(), p))); }

  // --------------- Helpers ---------------
  protected getValue(row: T, col: DataTableColumn<T>): any {
    return col.value ? col.value(row) : row[col.key as keyof T];
  }
  protected getDisplay(row: T, col: DataTableColumn<T>): string {
    return col.format ? col.format(row) : String(this.getValue(row, col) ?? '');
  }
  protected trackByCol = (_: number, c: DataTableColumn<T>) => c.key;
  protected trackByRow = (_: number, r: T) => r[this.trackByKey()];
}
