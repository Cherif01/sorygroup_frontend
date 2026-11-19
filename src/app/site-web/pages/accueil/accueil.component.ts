import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

interface Service { icon: string; title: string; desc: string; }
interface Chiffre { value: string; label: string; }

@Component({
  selector: 'app-site-accueil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss',
})
export class AccueilComponent implements OnInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Images détectées dans public/images/landing/. On essaie 1..12 en .jpg/.jpeg/.png/.webp. */
  protected readonly slides = signal<string[]>([]);
  protected readonly current = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  private tryLoad(url: string): Promise<string | null> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private async detectImages(): Promise<void> {
    const max = 12;
    const exts = ['jpg', 'jpeg', 'png', 'webp'];
    const candidates: string[] = [];
    for (let i = 1; i <= max; i++) {
      for (const e of exts) candidates.push(`/images/landing/landing${i}.${e}`);
    }
    const results = await Promise.all(candidates.map(url => this.tryLoad(url)));
    const found: string[] = [];
    // Préserver l'ordre : d'abord toutes les variantes de landing1, puis landing2, etc.
    // On ne garde qu'une image par numéro (la première extension trouvée).
    for (let i = 1; i <= max; i++) {
      const start = (i - 1) * exts.length;
      for (let k = 0; k < exts.length; k++) {
        if (results[start + k]) { found.push(candidates[start + k]); break; }
      }
    }
    if (found.length === 0) {
      // fallback statique
      found.push('/images/landing/landing1.jpg');
    }
    this.slides.set(found);
    this.current.set(0);
    if (found.length > 1) this.startAuto();
  }

  private startAuto(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.current.update(i => (i + 1) % this.slides().length);
    }, 5500);
  }

  ngOnInit(): void {
    if (this.isBrowser) void this.detectImages();
  }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }
  goTo(i: number): void {
    this.current.set(i);
    this.startAuto();
  }

  protected readonly services: Service[] = [
    { icon: 'sprout',           title: 'Producteurs & collecte', desc: "Enregistrement des producteurs, suivi des champs, pesées et bordereaux." },
    { icon: 'warehouse',        title: 'Dépôts & traitement',    desc: "Réception, formation des lots, séchage, tri, inventaires et sorties." },
    { icon: 'handshake',        title: 'Ventes & export',        desc: "Clients, contrats, factures, dossiers d'export, suivi des expéditions." },
    { icon: 'landmark',         title: 'Comptabilité',           desc: "Avances aux producteurs, trésorerie, dépenses et résultat de campagne." },
    { icon: 'layout-dashboard', title: 'Pilotage',               desc: "Tableaux de bord temps réel, alertes, approbations et rapports." },
    { icon: 'briefcase',        title: 'Ressources humaines',    desc: "Employés, contrats, présences, congés et paie — en option." },
  ];

  protected readonly chiffres: Chiffre[] = [
    { value: '4',      label: 'Filières (cajou, cacao, café, karité)' },
    { value: '1 500+', label: 'Producteurs suivis' },
    { value: '8',      label: 'Applications métier' },
    { value: '100%',   label: 'Traçabilité du champ à la vente' },
  ];

  protected readonly etapes = [
    { num: '01', titre: 'Champ',       desc: 'Le producteur est enregistré et sa parcelle localisée.' },
    { num: '02', titre: 'Collecte',    desc: 'Pesée à la récolte, bordereau et envoi au dépôt.' },
    { num: '03', titre: 'Traitement',  desc: 'Formation du lot, séchage, tri, mesures de qualité.' },
    { num: '04', titre: 'Vente',       desc: 'Lot de vente, facture, dossier d\'export, encaissement.' },
  ];

  /** Flux chevauchant la fin du hero : du champ à l'export. */
  protected readonly flux = [
    { num: '01', icon: 'sprout',         titre: 'Champ',      sub: 'Récolte', desc: 'Production au champ, estimation de la récolte.' },
    { num: '02', icon: 'scale',          titre: 'Collecte',   sub: 'Pesée',   desc: 'Pesée sur place, bordereau d\'envoi, prix du jour.' },
    { num: '03', icon: 'warehouse',      titre: 'Dépôt',      sub: 'Réception', desc: 'Formation des lots, mesure d\'humidité, stockage.' },
    { num: '04', icon: 'sun',            titre: 'Traitement', sub: 'Qualité', desc: 'Séchage, tri, analyse qualité, mise aux normes.' },
    { num: '05', icon: 'handshake',      titre: 'Vente',      sub: 'Contrats', desc: 'Lot de vente, facture, négociation avec l\'acheteur.' },
    { num: '06', icon: 'ship',           titre: 'Export',     sub: 'Expédition', desc: 'Dossier d\'export, chargement, suivi du conteneur.' },
  ];

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
