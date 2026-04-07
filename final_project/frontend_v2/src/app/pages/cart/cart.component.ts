import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <h1 class="page-title">Your Cart</h1>
      @if (cart.items().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <p>Your cart is empty.</p>
          <a routerLink="/" class="btn btn-primary" style="margin-top:16px">Continue Shopping</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items card">
            @for (item of cart.items(); track item.id) {
              <div class="cart-row">
                <img [src]="imgUrl(item.product.imagePath)" [alt]="item.product.name" class="cart-img" />
                <div class="cart-info">
                  <a [routerLink]="['/product', item.product.id]" class="cart-name">{{item.product.name}}</a>
                  <div class="cart-unit">\${{item.product.price | number:'1.2-2'}} each</div>
                </div>
                <div class="cart-qty">
                  <button class="qty-btn" (click)="changeQty(item.id, item.quantity - 1)" [disabled]="item.quantity <= 1">−</button>
                  <span>{{item.quantity}}</span>
                  <button class="qty-btn" (click)="changeQty(item.id, item.quantity + 1)" [disabled]="item.quantity >= item.product.stock">+</button>
                </div>
                <div class="cart-subtotal">\${{(item.product.price * item.quantity) | number:'1.2-2'}}</div>
                <button class="btn btn-danger btn-sm" (click)="cart.remove(item.id).subscribe()">Remove</button>
              </div>
            }
          </div>

          <div class="cart-summary card">
            <h3>Order Summary</h3>
            <div class="summary-row"><span>Items ({{cart.count}})</span><span>\${{cart.total | number:'1.2-2'}}</span></div>
            <div class="summary-row summary-total"><span>Total</span><span>\${{cart.total | number:'1.2-2'}}</span></div>
            <a routerLink="/checkout" class="btn btn-primary btn-full" style="margin-top:16px">Proceed to Checkout</a>
            <a routerLink="/" class="btn btn-outline btn-full" style="margin-top:8px">Continue Shopping</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
    @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } }
    .cart-items { padding: 0; }
    .cart-row { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #eee; flex-wrap: wrap; }
    .cart-row:last-child { border-bottom: none; }
    .cart-img { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .cart-info { flex: 1; min-width: 120px; }
    .cart-name { font-weight: 600; color: #222; font-size: 0.95rem; }
    .cart-name:hover { color: #e94560; }
    .cart-unit { color: #888; font-size: 0.85rem; margin-top: 4px; }
    .cart-qty { display: flex; align-items: center; gap: 10px; }
    .qty-btn { width: 28px; height: 28px; border: 1.5px solid #ddd; background: #fff; border-radius: 6px; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .qty-btn:hover:not(:disabled) { border-color: #e94560; color: #e94560; }
    .qty-btn:disabled { opacity: .4; cursor: not-allowed; }
    .cart-subtotal { font-weight: 700; min-width: 70px; text-align: right; }
    .cart-summary { padding: 24px; }
    .cart-summary h3 { font-size: 1.1rem; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.95rem; color: #555; }
    .summary-total { font-size: 1.1rem; font-weight: 700; color: #222; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; }
  `]
})
export class CartComponent {
  constructor(public cart: CartService, private productService: ProductService) {}
  imgUrl(p: string | null) { return this.productService.getImageUrl(p); }
  changeQty(itemId: number, qty: number) { if (qty >= 1) this.cart.updateQty(itemId, qty).subscribe(); }
}
