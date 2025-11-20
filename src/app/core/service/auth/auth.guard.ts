import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no hay token → directo al login
  if (!authService.hasToken()) {
    router.navigate(['/login']);
    return false;
  }

  // Si hay token, intentamos refrescar
  return authService.refreshToken().pipe(
    map(res => {

      // Si refresh devolvió un token válido
      if (res && authService.hasToken()) {
        return true;
      }

      // Si el refresh no devolvió nada → deslogueo
      authService.logout();
      router.navigate(['/login']);
      return false;
    }),

    catchError(() => {
      authService.logout();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
