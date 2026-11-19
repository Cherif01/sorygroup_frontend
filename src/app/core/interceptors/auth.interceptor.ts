import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { BASE_URL } from '../../config';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notif = inject(NotificationService);

  const token = auth.getToken();
  const sameApi = BASE_URL && req.url.startsWith(BASE_URL);

  const authed = sameApi && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authed).pipe(
    catchError(err => {
      if (err.status === 401) {
        notif.warning('Votre session a expiré, veuillez vous reconnecter.', 'Session expirée');
        auth.closeSession();
      } else if (err.status === 403) {
        notif.error("Vous n'avez pas le droit d'effectuer cette action.", 'Accès refusé');
      } else if (err.status >= 500) {
        notif.error('Erreur serveur. Veuillez réessayer.', 'Erreur');
      }
      return throwError(() => err);
    }),
  );
};
