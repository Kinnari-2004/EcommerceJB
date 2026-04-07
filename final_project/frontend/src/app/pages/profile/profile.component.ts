import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page" style="max-width:600px">
      <h1 class="page-title">My Profile</h1>

      <div class="card section-card">
        <h3>Personal Information</h3>
        @if (profileMsg()) {
          <div class="alert" [class.alert-success]="!profileErr()" [class.alert-error]="profileErr()">
            {{profileMsg()}}
          </div>
        }
        <div class="form-group"><label>Name</label>
          <input type="text" [(ngModel)]="name" />
        </div>
        <div class="form-group"><label>Email</label>
          <input type="email" [(ngModel)]="email" />
        </div>
        <button class="btn btn-primary" [disabled]="savingProfile()" (click)="saveProfile()">
          {{savingProfile() ? 'Saving...' : 'Save Changes'}}
        </button>
      </div>

      <div class="card section-card">
        <h3>Change Password</h3>
        @if (pwMsg()) {
          <div class="alert" [class.alert-success]="!pwErr()" [class.alert-error]="pwErr()">
            {{pwMsg()}}
          </div>
        }
        <div class="form-group"><label>Current Password</label>
          <input type="password" [(ngModel)]="currentPw" />
        </div>
        <div class="form-group"><label>New Password</label>
          <input type="password" [(ngModel)]="newPw" />
        </div>
        <button class="btn btn-secondary" [disabled]="savingPw()" (click)="changePassword()">
          {{savingPw() ? 'Updating...' : 'Update Password'}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .section-card { padding: 28px; margin-bottom: 24px; }
    .section-card h3 { font-size: 1.1rem; margin-bottom: 20px; color: #1a1a2e; }
  `]
})
export class ProfileComponent implements OnInit {
  name = ''; email = '';
  currentPw = ''; newPw = '';
  savingProfile = signal(false); profileMsg = signal(''); profileErr = signal(false);
  savingPw = signal(false); pwMsg = signal(''); pwErr = signal(false);

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe(u => {
      this.name = u.name;
      this.email = u.email;
    });
  }

  saveProfile() {
    this.savingProfile.set(true); this.profileMsg.set(''); this.profileErr.set(false);
    this.profileService.updateProfile({ name: this.name, email: this.email }).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.profileMsg.set('Profile updated!');
        this.authService.init().subscribe();
      },
      error: (err: any) => {
        this.savingProfile.set(false);
        this.profileMsg.set(err?.error?.error || 'Failed to update');
        this.profileErr.set(true);
      }
    });
  }

  changePassword() {
    if (!this.currentPw || !this.newPw) { this.pwMsg.set('Both fields required.'); this.pwErr.set(true); return; }
    this.savingPw.set(true); this.pwMsg.set(''); this.pwErr.set(false);
    this.http.post<any>('/api/auth/change-password', {
      currentPassword: this.currentPw,
      newPassword: this.newPw
    }).subscribe({
      next: () => {
        this.savingPw.set(false);
        this.pwMsg.set('Password updated!');
        this.currentPw = ''; this.newPw = '';
      },
      error: (err: any) => {
        this.savingPw.set(false);
        this.pwMsg.set(err?.error?.error || 'Failed');
        this.pwErr.set(true);
      }
    });
  }
}
