import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { APP_NAME, APP_TAGLINE } from '../../../config';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly notif = inject(NotificationService);

  protected readonly appName = APP_NAME;
  protected readonly appTagline = APP_TAGLINE;
  protected readonly telephone = signal('');
  protected readonly motDePasse = signal('');
  protected readonly showPass = signal(false);
  protected readonly remember = signal(true);
  protected readonly loading = signal(false);
  protected readonly year = new Date().getFullYear();

  submit() {
    if (!this.telephone().trim() || !this.motDePasse().trim()) {
      this.notif.warning('Veuillez saisir votre téléphone et mot de passe.');
      return;
    }
    this.loading.set(true);
    this.auth.login(this.telephone(), this.motDePasse()).subscribe({
      next: () => {
        this.loading.set(false);
        this.notif.success('Bienvenue sur ' + this.appName);
      },
      error: () => {
        this.loading.set(false);
        this.notif.error('Téléphone ou mot de passe incorrect.');
      },
    });
  }
}
