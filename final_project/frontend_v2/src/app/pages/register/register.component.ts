import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-narrow">
      <div class="auth-box">
        <h2>Create Account</h2>
        @if (error()) { <div class="alert alert-error">{{error()}}</div> }
        @if (success()) { <div class="alert alert-success">{{success()}}</div> }
        <div class="form-group"><label>Full Name</label>
          <input type="text" [(ngModel)]="name" placeholder="Jane Doe" />
        </div>
        <div class="form-group"><label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="you@example.com" />
        </div>
        <div class="form-group"><label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="Min. 6 characters" />
        </div>
        <button class="btn btn-primary btn-full" [disabled]="loading()" (click)="register()">
          {{loading() ? 'Creating account…' : 'Register'}}
        </button>
        <div class="auth-link">Already have an account? <a routerLink="/login">Sign in</a></div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = ''; email = ''; password = '';
  loading = signal(false); error = signal(''); success = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password) { this.error.set('All fields are required.'); return; }
    this.loading.set(true); this.error.set('');
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Account created! Redirecting to login…');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => { this.loading.set(false); this.error.set(err?.error?.error || 'Registration failed'); }
    });
  }
}
