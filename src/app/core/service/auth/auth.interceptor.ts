import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Agregar access token
  const authReq = req.clone({
    withCredentials: true,        // ✔ necesario para cookies
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (req.url.includes('/auth/refresh')) {
        authService.logout();
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap(() => {
          const newToken = authService.getToken();

          if (!newToken) {
            authService.logout();
            return throwError(() => error);
          }

          const retryReq = req.clone({
            withCredentials: true, // ✔ cookies en reintento
            setHeaders: { Authorization: `Bearer ${newToken}` }
          });

          return next(retryReq);
        }),
        catchError(() => {
          authService.logout();
          return throwError(() => error);
        })
      );
    })
  );
};
