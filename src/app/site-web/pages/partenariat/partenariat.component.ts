import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { APP_PATHS } from '../../../config';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-site-partenariat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, IconComponent, PageHeroComponent],
  templateUrl: './partenariat.component.html',
  styleUrls: ['../accueil/accueil.component.scss', './partenariat.component.scss'],
})
export class PartenariatComponent {
  private readonly notif = inject(NotificationService);
  protected readonly paths = APP_PATHS;

  protected readonly avantages = [
    { icon: 'hand-coins', titre: 'Avances au démarrage',
      desc: 'Recevez une avance en début de campagne pour préparer vos champs et votre récolte.' },
    { icon: 'scale',      titre: 'Pesées justes et tracées',
      desc: 'Vos sacs sont pesés sur place, le prix du jour est appliqué, vous recevez un reçu immédiatement.' },
    { icon: 'banknote',   titre: 'Paiement rapide',
      desc: 'Vous êtes payé dans les 48 heures après la validation de votre pesée.' },
    { icon: 'user',       titre: 'Votre espace producteur',
      desc: 'Consultez vos livraisons, vos paiements et vos avances depuis votre téléphone, à tout moment.' },
    { icon: 'briefcase',  titre: 'Formation & appui',
      desc: 'Nos superviseurs vous conseillent sur les bonnes pratiques et le suivi de vos parcelles.' },
    { icon: 'ship',       titre: 'Débouchés à l\'export',
      desc: 'Votre récolte est acheminée vers les acheteurs internationaux — meilleur prix, meilleure visibilité.' },
  ];

  protected readonly etapes = [
    { num: '1', titre: 'Je remplis le formulaire', desc: 'Ci-dessous, en 2 minutes.' },
    { num: '2', titre: 'Le superviseur me contacte', desc: 'Sous 72 h pour prendre rendez-vous.' },
    { num: '3', titre: 'Visite de mes champs',       desc: 'Mesure des parcelles et évaluation de la récolte.' },
    { num: '4', titre: 'Je rejoins Sory Group',      desc: 'Je deviens producteur Sory Group.' },
  ];

  // Formulaire — producteur agricole
  protected readonly prenom = signal('');
  protected readonly nom = signal('');
  protected readonly telephone = signal('');
  protected readonly village = signal('');
  protected readonly prefecture = signal('');
  protected readonly produit = signal('');
  protected readonly surface = signal('');
  protected readonly quantite = signal('');
  protected readonly experience = signal('');
  protected readonly message = signal('');
  protected readonly accept = signal(false);
  protected readonly sent = signal(false);
  protected readonly loading = signal(false);

  submit() {
    if (!this.prenom().trim() || !this.nom().trim() || !this.telephone().trim() ||
        !this.village().trim() || !this.produit()) {
      this.notif.warning('Merci de remplir les champs marqués obligatoires.');
      return;
    }
    if (!this.accept()) {
      this.notif.warning('Merci de confirmer que vous souhaitez être contacté.');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.sent.set(true);
      this.notif.success('Votre demande a bien été enregistrée. Un superviseur vous appellera.', 'Merci !');
    }, 700);
  }
}
