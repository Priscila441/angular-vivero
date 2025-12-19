import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api_url = environment.API_URL + '/auth';
  private tokenKey = 'auth_token';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(
      `${this.api_url}/login`,
      { email, password },
      { withCredentials: true }   // ✔ necesario por cookies httpOnly
    )
    .pipe(
      tap((res) => {
        const token = res?.data?.token;

        if (token) {
          localStorage.setItem(this.tokenKey, token);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  refreshToken() {
    return this.http.post<any>(
      `${this.api_url}/refresh`,
      {},                 // sin refreshToken en body
      { withCredentials: true }   // ✔ cookie con httpOnly
    )
    .pipe(
      tap((res) => {
        const newToken = res?.data?.accessToken;
        if (newToken) {
          localStorage.setItem(this.tokenKey, newToken);
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
    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  forgotPassword(email: string) {
  return this.http.post<any>(
    `${this.api_url}/forgot-password`,
    { email }
  );
}

resetPassword(token: string, password: string) {
  return this.http.post<any>(
    `${this.api_url}/reset-password`,
    { token, password }
  );
}

}
