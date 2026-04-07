import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page" style="max-width:600px">
      @if (loading()) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (order()) {
        <div class="confirm-box card">
          <div class="confirm-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p class="confirm-sub">Thank you! Order #{{order()!.id}} has been placed.</p>
          <div class="confirm-details">
            <div class="detail-row"><span>Order #</span><strong>{{order()!.id}}</strong></div>
            <div class="detail-row"><span>Date</span><strong>{{order()!.placedAt | date:'medium'}}</strong></div>
            <div class="detail-row"><span>Payment</span><strong>{{order()!.paymentMethod}}</strong></div>
          </div>
          <h3 style="margin:20px 0 12px">Items</h3>
          @for (item of order()!.items; track item.id) {
            <div class="confirm-item">
              <span class="item-name">{{item.productName}}</span>
              <span class="item-qty">x{{item.quantity}}</span>
              <span class="item-price">\${{(item.priceAtPurchase * item.quantity) | number:'1.2-2'}}</span>
            </div>
          }
          <div class="confirm-total">
            <span>Total</span><span>\${{order()!.totalAmount | number:'1.2-2'}}</span>
          </div>
          <div class="confirm-actions">
            <a routerLink="/orders" class="btn btn-secondary">View Orders</a>
            <a routerLink="/" class="btn btn-primary">Continue Shopping</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .confirm-box { padding: 40px; text-align: center; }
    .confirm-icon { font-size: 3.5rem; margin-bottom: 16px; }
    h1 { font-size: 1.8rem; color: #1a1a2e; margin-bottom: 8px; }
    .confirm-sub { color: #666; margin-bottom: 28px; }
    .confirm-details { background: #f8f8fb; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; text-align: left; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .confirm-item { display: flex; gap: 12px; text-align: left; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 0.9rem; }
    .item-name { flex: 1; }
    .item-qty { color: #888; }
    .item-price { font-weight: 700; min-width: 80px; text-align: right; }
    .confirm-total { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; padding-top: 14px; color: #e94560; }
    .confirm-actions { display: flex; gap: 12px; justify-content: center; margin-top: 28px; }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrder(id).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
