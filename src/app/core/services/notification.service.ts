import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastr = inject(ToastrService);

  success(message: string, title = 'Succès') { this.toastr.success(message, title); }
  error(message: string, title = 'Erreur')   { this.toastr.error(message, title); }
  warning(message: string, title = 'Attention') { this.toastr.warning(message, title); }
  info(message: string, title = 'Information') { this.toastr.info(message, title); }
}
