import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api_url = environment.API_URL + '/auth';
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.api_url}/login`, { email, password }).pipe(
      tap((res) => {
        if (res?.data?.token) {
          localStorage.setItem(this.tokenKey, res.data.token);
          // Simulamos refresh token para cuando el backend lo implemente
          localStorage.setItem(this.refreshTokenKey, 'dummy_refresh_token');
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  refreshToken() {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) return of(null);

    return this.http.post<any>(`${this.api_url}/refresh`, { refreshToken }).pipe(
      tap((res) => {
        if (res?.data?.token) {
          localStorage.setItem(this.tokenKey, res.data.token);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getUserInfo() {

    return { nombre: 'Administrador', email: 'admin@example.com' };
    }

    isAdminLoggedIn(): boolean {
    return this.hasToken();
    }

}
