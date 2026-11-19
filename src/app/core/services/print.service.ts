import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { APP_NAME } from '../../config';

export interface PrintField {
  label: string;
  value: string | number | null | undefined;
  /** Mise en forme : 'money', 'weight', 'pct', 'date', 'raw' */
  format?: 'money' | 'weight' | 'pct' | 'date' | 'raw';
  /** Classe de ton pour la pastille (si applicable). */
  tone?: 'ok' | 'wait' | 'danger' | 'info' | 'off' | 'neutral';
  /** Pleine largeur sur le document. */
  full?: boolean;
}

export interface PrintSection {
  title: string;
  fields?: PrintField[];
  table?: { columns: Array<{ label: string; key: string; align?: 'left' | 'right' | 'center'; format?: (row: any) => string }>; rows: any[]; };
  html?: string;
}

export interface PrintDocument {
  /** Type de document (ex. "Reçu de versement d'avance") */
  documentType: string;
  /** Référence (ex. "AV-2026-000312") */
  reference?: string;
  /** Titre principal */
  title: string;
  /** Sous-titre */
  subtitle?: string;
  /** Sections du document */
  sections: PrintSection[];
  /** Mention légale en pied */
  legalNote?: string;
  /** Format : A4 portrait par défaut */
  orientation?: 'portrait' | 'landscape';
}

@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ===================================================================
  // API : fiche détail (portrait)
  // ===================================================================
  printFiche(opts: { entityLabel: string; reference?: string; title: string; subtitle?: string; fields: PrintField[] }): void {
    this.print({
      documentType: `${opts.entityLabel.toUpperCase()} — FICHE`,
      reference: opts.reference,
      title: opts.title,
      subtitle: opts.subtitle,
      sections: [{ title: 'Informations', fields: opts.fields }],
      legalNote: `Document généré par ${APP_NAME}. Ce document fait foi uniquement s'il est signé et tamponné.`,
    });
  }

  // ===================================================================
  // API : liste / rapport (paysage)
  // ===================================================================
  printTable(opts: {
    title: string;
    subtitle?: string;
    columns: Array<{ label: string; key: string; align?: 'left' | 'right' | 'center'; format?: (row: any) => string }>;
    rows: any[];
  }): void {
    this.print({
      documentType: 'RAPPORT',
      title: opts.title,
      subtitle: opts.subtitle,
      sections: [{ title: '', table: { columns: opts.columns, rows: opts.rows } }],
      orientation: 'landscape',
      legalNote: `${opts.rows.length} ligne(s) · Éditée le ${this.dateStr()} par ${APP_NAME}`,
    });
  }

  // ===================================================================
  // API : reçu de transaction (ex. versement d'avance, paiement, encaissement)
  // ===================================================================
  printRecu(opts: {
    type: 'avance' | 'paiement-producteur' | 'encaissement' | 'reglement' | 'transfert' | 'salaire';
    reference: string;
    date: string;
    de: string;             // ex. 'Caisse Kindia'
    vers: string;           // ex. 'Mamadou BAH (PR-0032)'
    montant: number;
    devise?: string;
    mode: string;           // ex. 'Espèces', 'Orange Money', 'Virement bancaire'
    reference_externe?: string;
    motif: string;
    responsable?: string;
  }): void {
    const labels: Record<string, string> = {
      'avance': 'REÇU DE VERSEMENT D\'AVANCE',
      'paiement-producteur': 'REÇU DE PAIEMENT DE PESÉE',
      'encaissement': 'REÇU D\'ENCAISSEMENT CLIENT',
      'reglement': 'REÇU DE RÈGLEMENT',
      'transfert': 'REÇU DE TRANSFERT DE FONDS',
      'salaire': 'REÇU DE PAIEMENT DE SALAIRE',
    };
    const fields: PrintField[] = [
      { label: 'Date de l\'opération', value: opts.date, format: 'date' },
      { label: 'Mode de paiement',     value: opts.mode },
      { label: 'Compte émetteur',      value: opts.de,   full: true },
      { label: 'Bénéficiaire',         value: opts.vers, full: true },
      { label: 'Montant',              value: opts.montant, format: 'money' },
      { label: 'Devise',               value: opts.devise ?? 'GNF' },
      { label: 'Référence externe',    value: opts.reference_externe ?? '—' },
      { label: 'Responsable',          value: opts.responsable ?? '—' },
      { label: 'Motif',                value: opts.motif, full: true },
    ];
    this.print({
      documentType: labels[opts.type],
      reference: opts.reference,
      title: labels[opts.type],
      subtitle: `${opts.montant.toLocaleString('fr-FR')} ${opts.devise ?? 'GNF'} — ${opts.vers}`,
      sections: [
        { title: 'Détails de l\'opération', fields },
        { title: 'Signatures', html: this.signatureBlock() },
      ],
      legalNote: `Ce reçu atteste du paiement effectué. Un exemplaire est conservé par ${APP_NAME}, un autre remis au bénéficiaire.`,
    });
  }

  // ===================================================================
  // GABARITS SPÉCIFIQUES
  // ===================================================================

  /** Bulletin de paie — RH */
  printBulletin(opts: {
    reference: string;
    periode: string;
    employe: { matricule: string; nom_complet: string; poste: string; service: string; date_embauche?: string; };
    lignes: Array<{ rubrique: string; type: 'gain' | 'retenue' | 'cotisation'; base?: number; taux?: number; montant: number; }>;
    totaux: { brut: number; retenues: number; net_a_payer: number; cotisations_employeur?: number; devise?: string; };
  }): void {
    const devise = opts.totaux.devise ?? 'GNF';
    const lignesTable = {
      columns: [
        { label: 'Rubrique', key: 'rubrique', align: 'left' as const },
        { label: 'Base',     key: 'base',     align: 'right' as const, format: (r: any) => r.base ? r.base.toLocaleString('fr-FR') : '—' },
        { label: 'Taux %',   key: 'taux',     align: 'right' as const, format: (r: any) => r.taux ? r.taux.toFixed(1).replace('.', ',') : '—' },
        { label: 'Gain',     key: '_gain',    align: 'right' as const, format: (r: any) => r.type === 'gain' ? r.montant.toLocaleString('fr-FR') : '' },
        { label: 'Retenue',  key: '_ret',     align: 'right' as const, format: (r: any) => r.type !== 'gain' ? r.montant.toLocaleString('fr-FR') : '' },
      ],
      rows: opts.lignes,
    };
    this.print({
      documentType: 'BULLETIN DE PAIE',
      reference: opts.reference,
      title: `Bulletin de paie — ${opts.periode}`,
      subtitle: `${opts.employe.nom_complet} · ${opts.employe.poste}`,
      sections: [
        { title: 'Identification', fields: [
          { label: 'Matricule', value: opts.employe.matricule },
          { label: 'Nom et prénom', value: opts.employe.nom_complet },
          { label: 'Poste', value: opts.employe.poste },
          { label: 'Service', value: opts.employe.service },
          { label: 'Date d\'embauche', value: opts.employe.date_embauche ?? '—' },
          { label: 'Période de paie', value: opts.periode },
        ]},
        { title: 'Détail des rubriques', table: lignesTable },
        { title: 'Totaux', fields: [
          { label: 'Salaire brut',     value: opts.totaux.brut,          format: 'money' },
          { label: 'Total retenues',   value: opts.totaux.retenues,      format: 'money' },
          { label: 'Cotisations employeur', value: opts.totaux.cotisations_employeur ?? 0, format: 'money' },
          { label: 'Net à payer',      value: opts.totaux.net_a_payer,   format: 'money', full: true, tone: 'ok' },
        ]},
        { title: 'Signatures', html: this.signatureBlock() },
      ],
      legalNote: `Bulletin de paie établi conformément au Code du travail guinéen. Ce document a valeur probante.`,
    });
    void devise;
  }

  /** Contrat de travail — RH */
  printContrat(opts: {
    reference: string;
    employe: { nom_complet: string; telephone: string; adresse?: string; piece_identite?: string; };
    type_contrat: 'CDI' | 'CDD' | 'Stage';
    date_debut: string;
    date_fin?: string;
    poste: string;
    service: string;
    salaire_base: number;
    periode_essai_mois?: number;
    clauses?: string;
  }): void {
    this.print({
      documentType: 'CONTRAT DE TRAVAIL',
      reference: opts.reference,
      title: `Contrat de travail — ${opts.type_contrat}`,
      subtitle: `Entre Sory Group SARLU et ${opts.employe.nom_complet}`,
      sections: [
        { title: 'Parties au contrat', html: `
          <p><strong>L'Employeur</strong> : <b>SORY GROUP SARLU</b>, société à responsabilité limitée unipersonnelle,
          dont le siège est sis Km 36, route de Kindia, Conakry, Guinée, représentée par son Gérant.</p>
          <p style="margin-top:8px;"><strong>Le Salarié</strong> : <b>${this.escape(opts.employe.nom_complet)}</b>,
          joignable au ${this.escape(opts.employe.telephone)}${opts.employe.adresse ? ', demeurant à ' + this.escape(opts.employe.adresse) : ''}.</p>
        `},
        { title: 'Modalités', fields: [
          { label: 'Type de contrat',  value: opts.type_contrat },
          { label: 'Date de prise de fonction', value: opts.date_debut, format: 'date' },
          { label: 'Date de fin',      value: opts.date_fin ?? 'Indéterminée', format: 'date' },
          { label: 'Poste occupé',     value: opts.poste },
          { label: 'Service',          value: opts.service },
          { label: 'Salaire brut mensuel', value: opts.salaire_base, format: 'money' },
          { label: 'Période d\'essai', value: opts.periode_essai_mois ? opts.periode_essai_mois + ' mois' : 'Aucune' },
        ]},
        opts.clauses ? { title: 'Clauses particulières', html: `<p>${this.escape(opts.clauses)}</p>` } : null as any,
        { title: 'Signatures', html: this.signatureBlock() },
      ].filter(Boolean) as PrintSection[],
      legalNote: `Contrat conclu à Conakry, en deux exemplaires originaux.`,
    });
  }

  /** Facture — Ventes */
  printFacture(opts: {
    reference: string;
    date_emission: string;
    echeance?: string;
    client: { raison_sociale: string; pays: string; email?: string; };
    lignes: Array<{ designation: string; poids_kg: number; prix_unitaire: number; montant: number; }>;
    totaux: { montant_ht: number; taxes?: number; montant_ttc: number; devise: string; taux_change?: number; };
    conditions?: string;
  }): void {
    this.print({
      documentType: 'FACTURE',
      reference: opts.reference,
      title: `Facture ${opts.reference}`,
      subtitle: `${opts.client.raison_sociale} — ${opts.client.pays}`,
      sections: [
        { title: 'Émetteur / Destinataire', html: `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <div style="font-size:8pt;color:#848D87;text-transform:uppercase;letter-spacing:.06em;">De</div>
              <strong>SORY GROUP SARLU</strong><br/>
              RCCM/CKY/2015-A-12345 · NIF 00034-ABCDE<br/>
              Km 36, route de Kindia, Conakry, Guinée
            </div>
            <div>
              <div style="font-size:8pt;color:#848D87;text-transform:uppercase;letter-spacing:.06em;">À</div>
              <strong>${this.escape(opts.client.raison_sociale)}</strong><br/>
              ${this.escape(opts.client.pays)}<br/>
              ${opts.client.email ? this.escape(opts.client.email) : ''}
            </div>
          </div>
        `},
        { title: 'Dates', fields: [
          { label: 'Date d\'émission', value: opts.date_emission, format: 'date' },
          { label: 'Date d\'échéance', value: opts.echeance ?? '—', format: 'date' },
        ]},
        { title: 'Détail', table: {
          columns: [
            { label: 'Désignation', key: 'designation', align: 'left' },
            { label: 'Poids (kg)',  key: 'poids_kg',    align: 'right', format: (r: any) => r.poids_kg.toLocaleString('fr-FR') },
            { label: 'Prix unit.',  key: 'prix_unitaire', align: 'right', format: (r: any) => r.prix_unitaire.toLocaleString('fr-FR') + ' ' + opts.totaux.devise },
            { label: 'Montant',     key: 'montant',     align: 'right', format: (r: any) => r.montant.toLocaleString('fr-FR') + ' ' + opts.totaux.devise },
          ],
          rows: opts.lignes,
        }},
        { title: 'Totaux', fields: [
          { label: 'Montant HT',     value: `${opts.totaux.montant_ht.toLocaleString('fr-FR')} ${opts.totaux.devise}` },
          { label: 'Taxes',          value: `${(opts.totaux.taxes ?? 0).toLocaleString('fr-FR')} ${opts.totaux.devise}` },
          { label: 'Taux du jour',   value: opts.totaux.taux_change ? `1 ${opts.totaux.devise} = ${opts.totaux.taux_change.toLocaleString('fr-FR')} GNF` : '—' },
          { label: 'Total TTC',      value: `${opts.totaux.montant_ttc.toLocaleString('fr-FR')} ${opts.totaux.devise}`, full: true, tone: 'ok' },
        ]},
        opts.conditions ? { title: 'Conditions', html: `<p>${this.escape(opts.conditions)}</p>` } : null as any,
      ].filter(Boolean) as PrintSection[],
      legalNote: `Facture payable à l'échéance. Tout retard entraîne des pénalités selon les termes du contrat.`,
    });
  }

  /** Bordereau d'envoi — Terrain */
  printBordereau(opts: {
    reference: string;
    date_envoi: string;
    depot_destinataire: string;
    transporteur: string;
    immatriculation?: string;
    sacs: Array<{ numero: string; poids_kg: number; producteur: string; }>;
    poids_total_kg: number;
    cout_transport?: number;
  }): void {
    this.print({
      documentType: 'BORDEREAU D\'ENVOI',
      reference: opts.reference,
      title: `Bordereau d'envoi au dépôt`,
      subtitle: `${opts.sacs.length} sacs · ${opts.poids_total_kg.toLocaleString('fr-FR')} kg`,
      sections: [
        { title: 'Expédition', fields: [
          { label: 'Date d\'envoi',       value: opts.date_envoi, format: 'date' },
          { label: 'Dépôt destinataire',  value: opts.depot_destinataire },
          { label: 'Transporteur',        value: opts.transporteur },
          { label: 'Immatriculation',     value: opts.immatriculation ?? '—' },
          { label: 'Nombre de sacs',      value: opts.sacs.length },
          { label: 'Poids total',         value: `${opts.poids_total_kg.toLocaleString('fr-FR')} kg`, tone: 'ok' },
        ]},
        { title: 'Détail des sacs', table: {
          columns: [
            { label: 'N° sac',      key: 'numero',     align: 'left' },
            { label: 'Producteur',  key: 'producteur', align: 'left' },
            { label: 'Poids (kg)',  key: 'poids_kg',   align: 'right', format: (r: any) => r.poids_kg.toLocaleString('fr-FR') },
          ],
          rows: opts.sacs,
        }},
        { title: 'Signatures', html: this.signatureBlock() },
      ],
      legalNote: `À remettre au responsable du dépôt destinataire pour validation de la réception.`,
    });
  }

  // ===================================================================
  // IMPLÉMENTATION PRIVÉE
  // ===================================================================
  async print(doc: PrintDocument): Promise<void> {
    if (!this.isBrowser) return;
    const html = this.renderDocument(doc);
    const { default: printJS } = await import('print-js');
    printJS({
      printable: html,
      type: 'raw-html',
      style: this.css(doc.orientation ?? 'portrait'),
      scanStyles: false,
      documentTitle: `${APP_NAME} — ${doc.title}`,
    });
  }

  private renderDocument(doc: PrintDocument): string {
    const dateStr = this.dateStr();
    const timeStr = this.timeStr();
    const ref = doc.reference ?? 'SG-' + Date.now().toString(36).toUpperCase();
    const logoUrl = this.isBrowser ? `${location.origin}/logo.png` : '/logo.png';

    const sections = doc.sections.map(s => this.renderSection(s)).join('');

    return `
<div class="doc">
  <header class="doc__head">
    <div class="doc__brand">
      <span class="doc__logo"><img src="${logoUrl}" alt="" /></span>
      <div class="doc__name">
        <strong>SORY GROUP SARLU</strong>
        <small>Chaîne agricole — Conakry, Guinée</small>
        <small>Tél. +224 620 00 00 00 · contact@sorygroup.com</small>
      </div>
    </div>
    <div class="doc__ref">
      <span class="doc__type">${this.escape(doc.documentType)}</span>
      <strong>${this.escape(ref)}</strong>
      <small>${dateStr} · ${timeStr}</small>
    </div>
  </header>

  <div class="doc__title-block">
    <h1>${this.escape(doc.title)}</h1>
    ${doc.subtitle ? `<p class="doc__subtitle">${this.escape(doc.subtitle)}</p>` : ''}
  </div>

  <main class="doc__content">${sections}</main>

  <footer class="doc__foot">
    ${doc.legalNote ? `<p class="doc__legal">${this.escape(doc.legalNote)}</p>` : ''}
    <div class="doc__foot-line">
      <span>Page 1</span>
      <span>Document généré par <b>${APP_NAME}</b></span>
      <span>Vérif. <b>${this.escape(ref)}</b></span>
    </div>
  </footer>
</div>`;
  }

  private renderSection(s: PrintSection): string {
    const title = s.title ? `<h2 class="section__title">${this.escape(s.title)}</h2>` : '';
    if (s.html) return `<section class="section">${title}${s.html}</section>`;

    if (s.table) {
      const head = s.table.columns.map(c =>
        `<th${c.align === 'right' ? ' class="num"' : c.align === 'center' ? ' class="center"' : ''}>${this.escape(c.label)}</th>`,
      ).join('');
      const body = s.table.rows.map(r =>
        `<tr>${s.table!.columns.map(c => {
          const v = c.format ? c.format(r) : String(r[c.key] ?? '');
          return `<td${c.align === 'right' ? ' class="num"' : c.align === 'center' ? ' class="center"' : ''}>${this.escape(v)}</td>`;
        }).join('')}</tr>`,
      ).join('');
      return `<section class="section">${title}
        <table class="tbl">
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </section>`;
    }

    if (s.fields) {
      const items = s.fields.map(f => {
        const val = this.formatValue(f);
        return `<div class="field ${f.full ? 'field--full' : ''}">
          <dt>${this.escape(f.label)}</dt>
          <dd>${val}</dd>
        </div>`;
      }).join('');
      return `<section class="section">${title}<dl class="fields">${items}</dl></section>`;
    }

    return '';
  }

  private formatValue(f: PrintField): string {
    const v = f.value;
    if (v === null || v === undefined || v === '') return '<span class="muted">—</span>';
    let out: string;
    switch (f.format) {
      case 'money':  out = Number(v).toLocaleString('fr-FR') + ' GNF'; break;
      case 'weight': out = (Number(v) / 1000).toFixed(3).replace('.', ',') + ' kg'; break;
      case 'pct':    out = Number(v).toFixed(1).replace('.', ',') + ' %'; break;
      case 'date':   out = this.escape(String(v)); break;
      default:       out = this.escape(String(v));
    }
    return f.tone ? `<span class="pill pill--${f.tone}">${out}</span>` : out;
  }

  private signatureBlock(): string {
    return `<div class="signatures">
      <div class="signatures__box">
        <div class="signatures__label">Signature du responsable</div>
        <div class="signatures__area"></div>
      </div>
      <div class="signatures__box">
        <div class="signatures__label">Signature du bénéficiaire</div>
        <div class="signatures__area"></div>
      </div>
    </div>`;
  }

  private dateStr(): string {
    return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  private timeStr(): string {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  private escape(s: string): string {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]);
  }

  // ===================================================================
  // CSS A4 — passé en `style` à printJS
  // ===================================================================
  private css(orientation: 'portrait' | 'landscape'): string {
    return `
      @page { size: A4 ${orientation}; margin: 15mm 14mm 18mm 14mm; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1A201C; font-size: 10.5pt; line-height: 1.45; margin: 0; }
      .doc { width: 100%; }

      /* En-tête */
      .doc__head {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding-bottom: 10px; margin-bottom: 14px;
        border-bottom: 3px solid #1F6F4A;
      }
      .doc__brand { display: flex; align-items: center; gap: 12px; }
      .doc__logo {
        width: 54px; height: 54px;
        background: #fff;
        border: 1px solid #D8DDD9;
        border-radius: 50%;
        padding: 5px;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .doc__logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
      .doc__name strong {
        display: block; font-size: 13pt; font-weight: 700; letter-spacing: 0.02em;
        color: #14291F; margin-bottom: 2px;
      }
      .doc__name small {
        display: block; font-size: 8.5pt; color: #56605A;
      }
      .doc__ref {
        text-align: right; display: flex; flex-direction: column; gap: 3px;
      }
      .doc__type {
        display: inline-block;
        font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
        color: #185A3B;
        background: #E4F0E9;
        padding: 3px 10px;
        border-radius: 999px;
        margin-bottom: 4px;
        align-self: flex-end;
      }
      .doc__ref strong {
        font-family: 'Courier New', monospace;
        font-size: 11pt;
        letter-spacing: 0.08em;
        color: #1A201C;
      }
      .doc__ref small { font-size: 8.5pt; color: #848D87; }

      /* Titre */
      .doc__title-block { margin-bottom: 18px; }
      .doc__title-block h1 {
        font-size: 18pt; font-weight: 700;
        color: #1A201C; margin: 0 0 4px;
        letter-spacing: -0.015em;
      }
      .doc__subtitle {
        font-size: 10.5pt; color: #3A423D;
        margin: 0;
      }

      /* Sections */
      .doc__content { }
      .section { margin-bottom: 18px; page-break-inside: avoid; }
      .section__title {
        font-size: 10pt; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.1em;
        color: #185A3B;
        padding-bottom: 5px; margin: 0 0 10px;
        border-bottom: 1.5px solid #B9D8C6;
      }

      /* Champs clé/valeur */
      .fields {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 8px 24px;
        margin: 0;
      }
      .field {
        display: grid; grid-template-columns: 1fr; gap: 2px;
        padding: 5px 0;
        border-bottom: 1px dotted #D8DDD9;
      }
      .field--full { grid-column: 1 / -1; }
      .field dt {
        font-size: 8pt; color: #848D87;
        text-transform: uppercase; letter-spacing: 0.06em;
        font-weight: 600;
      }
      .field dd {
        margin: 0; font-size: 11pt; font-weight: 500; color: #1A201C;
      }

      /* Tableau */
      .tbl {
        width: 100%; border-collapse: collapse;
        font-size: 9.5pt;
      }
      .tbl th {
        background: #E4F0E9; color: #185A3B;
        padding: 8px 10px;
        text-align: left; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.05em;
        font-size: 8.5pt;
        border-bottom: 2px solid #1F6F4A;
      }
      .tbl td {
        padding: 7px 10px;
        border-bottom: 1px solid #EEF1EE;
      }
      .tbl tr:nth-child(even) td { background: #F6F7F5; }
      .tbl .num { text-align: right; font-variant-numeric: tabular-nums; }
      .tbl .center { text-align: center; }

      /* Pastilles de statut */
      .pill {
        display: inline-block; padding: 2px 10px;
        font-size: 8.5pt; font-weight: 600;
        border-radius: 999px; border: 1px solid transparent;
      }
      .pill--ok     { background: #E4F0E9; color: #185A3B; border-color: #B9D8C6; }
      .pill--wait   { background: #FBF3DE; color: #6B4700; border-color: #EFD79F; }
      .pill--info   { background: #EAF2F9; color: #1E5B8C; border-color: #BCD5EA; }
      .pill--danger { background: #FCECE9; color: #9F2D20; border-color: #EFC2BB; }
      .pill--off    { background: #FFF;     color: #848D87; border-color: #D8DDD9; text-decoration: line-through; }
      .pill--neutral{ background: #EEF1EE; color: #3A423D; border-color: #D8DDD9; }

      .muted { color: #B4BCB7; }

      /* Signatures */
      .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 10px; }
      .signatures__box { }
      .signatures__label {
        font-size: 8pt; color: #56605A;
        text-transform: uppercase; letter-spacing: 0.08em;
        margin-bottom: 6px;
      }
      .signatures__area {
        height: 60px;
        border: 1px dashed #B4BCB7;
        border-radius: 4px;
        background: repeating-linear-gradient(0deg, transparent 0 14px, #EEF1EE 14px 15px);
      }

      /* Pied de page */
      .doc__foot {
        position: fixed; bottom: 10mm; left: 14mm; right: 14mm;
        border-top: 1px solid #D8DDD9;
        padding-top: 6px;
      }
      .doc__legal {
        font-size: 8pt; color: #56605A;
        margin: 0 0 4px;
        font-style: italic;
      }
      .doc__foot-line {
        display: flex; justify-content: space-between;
        font-size: 7.5pt; color: #848D87;
      }
      .doc__foot-line b { color: #1F6F4A; }
    `;
  }
}
