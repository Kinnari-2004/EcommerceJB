import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(null);
  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  init(): Observable<AuthUser> {
    return this.http.get<AuthUser>('/api/auth/me').pipe(
      tap(u => this._user.set(u))
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/login', { email, password }).pipe(
      tap(() => this.init().subscribe())
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/register', { name, email, password });
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}).subscribe({
      complete: () => { this._user.set(null); this.router.navigate(['/login']); }
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post('/api/auth/forgot-password', { email });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post('/api/auth/reset-password', { email, code, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post('/api/auth/change-password', { currentPassword, newPassword });
  }

  isLoggedIn(): boolean { return this._user() !== null; }
  isAdmin(): boolean { return this._user()?.role === 'admin'; }
  isCustomer(): boolean { return this._user()?.role === 'customer'; }
}
