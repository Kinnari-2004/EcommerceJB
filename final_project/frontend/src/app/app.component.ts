import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="site-header">
      <div class="header-inner">
        <a routerLink="/" class="logo">ShopHub</a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          @if (auth.isCustomer()) {
            <a routerLink="/cart" class="cart-link">
              Cart
              @if (cart.count > 0) { <span class="badge">{{cart.count}}</span> }
            </a>
            <a routerLink="/orders">Orders</a>
            <a routerLink="/profile">Profile</a>
            <button class="btn-link" (click)="auth.logout()">Logout</button>
          } @else if (auth.isAdmin()) {
            <a routerLink="/admin">Admin Panel</a>
            <button class="btn-link" (click)="auth.logout()">Logout</button>
          } @else {
            <a routerLink="/login">Login</a>
            <a routerLink="/register">Register</a>
          }
        </nav>
      </div>
    </header>
    <main class="main-content">
      <router-outlet />
    </main>
    <footer class="site-footer">
      <p>&copy; 2024 ShopHub. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    .site-header { background: #1a1a2e; color: #fff; padding: 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,.3); }
    .header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
    .logo { color: #e94560; font-size: 1.5rem; font-weight: 700; text-decoration: none; letter-spacing: -0.5px; }
    .nav { display: flex; align-items: center; gap: 20px; }
    .nav a { color: #ccc; text-decoration: none; font-size: 0.95rem; transition: color .2s; }
    .nav a:hover, .nav a.active { color: #fff; }
    .btn-link { background: none; border: none; color: #ccc; cursor: pointer; font-size: 0.95rem; padding: 0; transition: color .2s; }
    .btn-link:hover { color: #fff; }
    .cart-link { position: relative; }
    .badge { background: #e94560; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 0.7rem; margin-left: 4px; }
    .main-content { min-height: calc(100vh - 120px); }
    .site-footer { background: #1a1a2e; color: #888; text-align: center; padding: 20px; font-size: 0.85rem; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService, public cart: CartService) {}
}
