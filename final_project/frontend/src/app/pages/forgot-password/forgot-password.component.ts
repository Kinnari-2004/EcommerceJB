import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-narrow">
      <div class="auth-box">
        <h2>Reset Password</h2>

        @if (step() === 1) {
          <p class="step-hint">Enter your email to receive a reset code.</p>
          @if (error()) { <div class="alert alert-error">{{error()}}</div> }
          <div class="form-group"><label>Email</label>
            <input type="email" [(ngModel)]="email" placeholder="you@example.com" />
          </div>
          <button class="btn btn-primary btn-full" [disabled]="loading()" (click)="requestCode()">
            {{loading() ? 'Sending...' : 'Get Reset Code'}}
          </button>
        }

        @if (step() === 2) {
          <div class="alert alert-info">
            <strong>Your reset code:</strong>
            <div class="reset-code">{{displayCode()}}</div>
            <small>Valid for 10 minutes. (In production this would be emailed.)</small>
          </div>
          @if (error()) { <div class="alert alert-error">{{error()}}</div> }
          <div class="form-group"><label>Enter Code</label>
            <input type="text" [(ngModel)]="code" placeholder="6-digit code" maxlength="6" />
          </div>
          <div class="form-group"><label>New Password</label>
            <input type="password" [(ngModel)]="newPassword" placeholder="Min. 6 characters" />
          </div>
          <button class="btn btn-primary btn-full" [disabled]="loading()" (click)="doReset()">
            {{loading() ? 'Resetting...' : 'Reset Password'}}
          </button>
        }

        @if (step() === 3) {
          <div class="alert alert-success">Password reset successfully! Redirecting to login...</div>
        }

        <div class="auth-link"><a routerLink="/login">Back to Login</a></div>
      </div>
    </div>
  `,
  styles: [`
    .step-hint { color: #666; margin-bottom: 20px; font-size: 0.9rem; }
    .reset-code { font-size: 2rem; font-weight: 800; letter-spacing: 6px; color: #e94560; text-align: center; margin: 8px 0; }
  `]
})
export class ForgotPasswordComponent {
  step = signal(1);
  email = ''; code = ''; newPassword = '';
  displayCode = signal('');
  loading = signal(false); error = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  requestCode() {
    if (!this.email) { this.error.set('Email required.'); return; }
    this.loading.set(true); this.error.set('');
    this.authService.forgotPassword(this.email.trim().toLowerCase()).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.displayCode.set(res.code || '(no code - email not registered)');
        this.step.set(2);
      },
      error: () => { this.loading.set(false); this.error.set('Something went wrong.'); }
    });
  }

  doReset() {
    if (!this.code || !this.newPassword) { this.error.set('Code and new password required.'); return; }
    this.loading.set(true); this.error.set('');
    this.authService.resetPassword(this.email, this.code, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set(3);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => { this.loading.set(false); this.error.set(err?.error?.error || 'Reset failed'); }
    });
  }
}
