import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-narrow">
      <div class="auth-box">
        <h2>Sign In</h2>
        @if (error()) { <div class="alert alert-error">{{error()}}</div> }
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="you@example.com" (keydown.enter)="login()" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••" (keydown.enter)="login()" />
        </div>
        <button class="btn btn-primary btn-full" [disabled]="loading()" (click)="login()">
          {{loading() ? 'Signing in…' : 'Sign In'}}
        </button>
        <div class="auth-link" style="margin-top:12px">
          <a routerLink="/forgot-password">Forgot password?</a>
        </div>
        <div class="auth-link">
          Don't have an account? <a routerLink="/register">Register</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = ''; password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private cart: CartService, private router: Router) {}

  login() {
    if (!this.email || !this.password) { this.error.set('Please enter email and password.'); return; }
    this.loading.set(true); this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.role === 'admin') { this.router.navigate(['/admin']); }
        else { this.cart.load(); this.router.navigate(['/']); }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Login failed');
      }
    });
  }
}
