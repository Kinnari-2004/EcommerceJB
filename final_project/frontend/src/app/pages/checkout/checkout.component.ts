import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash on Delivery', 'Bank Transfer'];

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page" style="max-width:760px">
      <h1 class="page-title">Checkout</h1>
      @if (cart.items().length === 0) {
        <div class="empty-state"><p>Your cart is empty. <a routerLink="/">Shop now</a></p></div>
      } @else {
        <div class="checkout-grid">
          <div class="card order-review">
            <h3>Order Review</h3>
            @for (item of cart.items(); track item.id) {
              <div class="review-row">
                <img [src]="imgUrl(item.product.imagePath)" [alt]="item.product.name" />
                <div class="review-info">
                  <span class="review-name">{{item.product.name}}</span>
                  <span class="review-meta">x{{item.quantity}} \${{item.product.price | number:'1.2-2'}}</span>
                </div>
                <span class="review-sub">\${{(item.product.price * item.quantity) | number:'1.2-2'}}</span>
              </div>
            }
            <div class="review-total">
              <span>Total</span><span>\${{cart.total | number:'1.2-2'}}</span>
            </div>
          </div>
          <div class="card payment-section">
            <h3>Payment Method</h3>
            @if (error()) { <div class="alert alert-error">{{error()}}</div> }
            @for (method of methods; track method) {
              <label class="payment-option" [class.selected]="selectedMethod === method">
                <input type="radio" name="payment" [value]="method" [(ngModel)]="selectedMethod" />
                <span class="payment-icon">{{methodIcon(method)}}</span>
                <span>{{method}}</span>
              </label>
            }
            <button class="btn btn-primary btn-full" style="margin-top:20px"
                    [disabled]="!selectedMethod || placing()" (click)="placeOrder()">
              {{placing() ? 'Placing order...' : 'Place Order'}}
            </button>
            <a routerLink="/cart" class="btn btn-outline btn-full" style="margin-top:8px">Back to Cart</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
    @media (max-width: 640px) { .checkout-grid { grid-template-columns: 1fr; } }
    .order-review, .payment-section { padding: 24px; }
    .order-review h3, .payment-section h3 { font-size: 1.1rem; margin-bottom: 18px; color: #1a1a2e; }
    .review-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eee; }
    .review-row img { width: 52px; height: 52px; object-fit: cover; border-radius: 6px; }
    .review-info { flex: 1; }
    .review-name { display: block; font-weight: 600; font-size: 0.9rem; }
    .review-meta { display: block; font-size: 0.8rem; color: #888; }
    .review-sub { font-weight: 700; }
    .review-total { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; padding-top: 14px; color: #e94560; }
    .payment-option { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 2px solid #e0e0e8; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: border-color .2s; }
    .payment-option.selected { border-color: #e94560; background: #fff5f7; }
    .payment-option input { cursor: pointer; }
    .payment-icon { font-size: 1.3rem; }
  `]
})
export class CheckoutComponent {
  methods = PAYMENT_METHODS;
  selectedMethod = '';
  placing = signal(false);
  error = signal('');

  constructor(
    public cart: CartService,
    private orderService: OrderService,
    private router: Router,
    private productService: ProductService
  ) {}

  imgUrl(p: string | null) { return this.productService.getImageUrl(p); }

  methodIcon(m: string): string {
    const icons: Record<string, string> = {
      'Credit Card': '💳', 'Debit Card': '💳',
      'Cash on Delivery': '💵', 'Bank Transfer': '🏦'
    };
    return icons[m] || '💳';
  }

  placeOrder() {
    if (!this.selectedMethod) { this.error.set('Please select a payment method.'); return; }
    this.placing.set(true); this.error.set('');
    this.orderService.checkout(this.selectedMethod).subscribe({
      next: (order) => {
        this.placing.set(false);
        this.cart.clear();
        this.router.navigate(['/order-confirmation', order.id]);
      },
      error: (err: any) => {
        this.placing.set(false);
        this.error.set(err?.error?.error || 'Checkout failed');
      }
    });
  }
}
