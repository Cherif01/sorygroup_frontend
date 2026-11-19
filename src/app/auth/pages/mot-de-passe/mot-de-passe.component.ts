import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_NAME } from '../../../config';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-mot-de-passe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent],
  template: `
    <section class="mdp">
      <div class="mdp__card">
        <div class="mdp__icon"><app-icon name="lock" [size]="32" /></div>
        <h1>Changer de mot de passe</h1>
        <p>Votre compte utilise un mot de passe provisoire. Choisissez-en un nouveau pour continuer.</p>

        <form class="stack" (ngSubmit)="submit()">
          <div class="field">
            <label class="field__label field__label--required">Nouveau mot de passe</label>
            <input type="password" class="field__input" [value]="p1()" (input)="p1.set($any($event.target).value)" required />
          </div>
          <div class="field">
            <label class="field__label field__label--required">Confirmer</label>
            <input type="password" class="field__input" [value]="p2()" (input)="p2.set($any($event.target).value)" required />
          </div>
          <button type="submit" class="btn btn--primary btn--lg">Enregistrer</button>
        </form>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .mdp {
      min-height: 100vh; height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background-image: var(--texture-login);
      padding: var(--space-4);
    }
    .mdp__card {
      background: var(--color-surface);
      border-radius: var(--radius-card-lg);
      box-shadow: var(--shadow-4);
      padding: var(--space-8);
      max-width: 440px; width: 100%;
      text-align: center;
    }
    .mdp__icon {
      width: 64px; height: 64px;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--color-primary-soft);
      color: var(--color-primary);
      border-radius: 50%;
      margin: 0 auto var(--space-4);
    }
    h1 { font-family: var(--font-title); font-size: var(--text-xl); margin-bottom: var(--space-2); }
    p { color: var(--color-text-muted); font-size: var(--text-sm); margin-bottom: var(--space-6); }
    form { text-align: left; }
    .btn { width: 100%; }
  `],
})
export class MotDePasseComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly notif = inject(NotificationService);

  protected readonly appName = APP_NAME;
  protected readonly p1 = signal('');
  protected readonly p2 = signal('');

  submit() {
    if (this.p1() !== this.p2()) { this.notif.error('Les deux mots de passe ne correspondent pas.'); return; }
    if (this.p1().length < 6) { this.notif.warning('Minimum 6 caractères.'); return; }
    // TODO : appel API /auth/mot-de-passe
    const user = this.auth.currentUser();
    if (user) this.auth.currentUser.set({ ...user, est_mot_de_passe_provisoire: false });
    this.notif.success('Mot de passe modifié.');
    void this.router.navigateByUrl(this.auth.landingUrl());
  }
}
