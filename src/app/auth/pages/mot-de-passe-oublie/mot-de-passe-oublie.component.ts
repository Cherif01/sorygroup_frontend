import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { APP_NAME, APP_PATHS } from '../../../config';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

interface Etape {
  n: number;
  titre: string;
  description: string;
  icone: string;
}

@Component({
  selector: 'app-mot-de-passe-oublie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent, RouterLink],
  templateUrl: './mot-de-passe-oublie.component.html',
  styleUrl: './mot-de-passe-oublie.component.scss',
})
export class MotDePasseOublieComponent {
  private readonly router = inject(Router);
  private readonly notif = inject(NotificationService);

  protected readonly appName = APP_NAME;
  protected readonly paths = APP_PATHS;
  protected readonly year = new Date().getFullYear();

  // Étapes
  protected readonly etapes: Etape[] = [
    { n: 1, titre: 'Identifiant',  description: 'Saisissez votre téléphone', icone: 'phone' },
    { n: 2, titre: 'Vérification', description: 'Entrez le code reçu par SMS', icone: 'key-round' },
    { n: 3, titre: 'Nouveau mot de passe', description: 'Choisissez un nouveau mot de passe', icone: 'lock' },
  ];

  protected readonly etape = signal(1);
  protected readonly loading = signal(false);
  protected readonly showPass = signal(false);
  protected readonly showPass2 = signal(false);

  // Champs
  protected readonly telephone = signal('');
  protected readonly code = signal(['', '', '', '', '', '']);
  protected readonly motDePasse = signal('');
  protected readonly motDePasse2 = signal('');

  // Progression
  protected readonly progress = computed(() => ((this.etape() - 1) / (this.etapes.length - 1)) * 100);

  protected readonly etapeCourante = computed(() => this.etapes[this.etape() - 1]);

  // Force du mot de passe
  protected readonly force = computed(() => {
    const p = this.motDePasse();
    if (!p) return { n: 0, label: '', couleur: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['Faible', 'Moyen', 'Fort', 'Très fort'];
    const couleurs = ['danger', 'wait', 'info', 'ok'];
    return { n: score, label: labels[Math.max(0, score - 1)], couleur: couleurs[Math.max(0, score - 1)] };
  });

  // ---------------- Actions ----------------

  envoyerSms() {
    if (!this.telephone().trim()) {
      this.notif.warning('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.notif.success('Un code de vérification a été envoyé par SMS.', 'Code envoyé');
      this.etape.set(2);
    }, 700);
  }

  updateCode(i: number, v: string) {
    const only = v.replace(/\D/g, '').slice(0, 1);
    this.code.update(c => { const n = [...c]; n[i] = only; return n; });
    if (only && i < 5) {
      setTimeout(() => {
        const next = document.getElementById('otp-' + (i + 1)) as HTMLInputElement | null;
        next?.focus();
      }, 0);
    }
  }

  onKeyOtp(ev: KeyboardEvent, i: number) {
    if (ev.key === 'Backspace' && !this.code()[i] && i > 0) {
      const prev = document.getElementById('otp-' + (i - 1)) as HTMLInputElement | null;
      prev?.focus();
    }
  }

  verifierCode() {
    const code = this.code().join('');
    if (code.length !== 6) {
      this.notif.warning('Le code doit contenir 6 chiffres.');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.notif.success('Code vérifié avec succès.');
      this.etape.set(3);
    }, 600);
  }

  renvoyerCode() {
    this.notif.info('Un nouveau code vient d\'être envoyé.', 'Code renvoyé');
  }

  enregistrerMotDePasse() {
    if (this.motDePasse() !== this.motDePasse2()) {
      this.notif.error('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (this.motDePasse().length < 8) {
      this.notif.warning('Minimum 8 caractères.');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.notif.success('Mot de passe modifié. Vous pouvez vous reconnecter.', 'Succès');
      void this.router.navigateByUrl(APP_PATHS.auth);
    }, 800);
  }

  retour() {
    if (this.etape() > 1) this.etape.update(e => e - 1);
  }

  trackEtape = (_: number, e: Etape) => e.n;
  trackCodeChar = (i: number) => i;
}
