import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-brand">⚙️ Admin</div>
        <nav class="admin-nav">
          <a routerLink="/admin/products" routerLinkActive="active">📦 Products</a>
          <a routerLink="/admin/customers" routerLinkActive="active">👥 Customers</a>
          <a routerLink="/admin/orders" routerLinkActive="active">🧾 Orders</a>
        </nav>
        <button class="admin-logout" (click)="auth.logout()">Logout</button>
      </aside>
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .admin-sidebar { width: 220px; background: #1a1a2e; color: #fff; display: flex; flex-direction: column; padding: 24px 0; flex-shrink: 0; }
    .admin-brand { font-size: 1.2rem; font-weight: 700; padding: 0 20px 24px; border-bottom: 1px solid #2a2a4e; }
    .admin-nav { display: flex; flex-direction: column; padding: 20px 0; flex: 1; }
    .admin-nav a { color: #aab; padding: 12px 20px; font-size: 0.95rem; transition: background .2s, color .2s; }
    .admin-nav a:hover { background: #2a2a4e; color: #fff; }
    .admin-nav a.active { background: #e94560; color: #fff; }
    .admin-logout { margin: 0 16px 20px; background: none; border: 1px solid #444; color: #aaa; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .admin-logout:hover { background: #333; color: #fff; }
    .admin-main { flex: 1; padding: 32px; background: #f5f5f7; overflow: auto; }
  `]
})
export class AdminShellComponent {
  constructor(public auth: AuthService) {}
}
