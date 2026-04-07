import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
template: `
  <div class="page" style="max-width:700px">
    <a routerLink="/orders" class="back-link">← Back to Orders</a>

    @if (loading()) {
      <div class="spinner-wrap"><div class="spinner"></div></div>
    }

    @if (order()) {
      <div class="card" style="padding:32px; margin-top:20px">
        <h1 class="page-title" style="margin-bottom:20px">Order #{{ order()!.id }}</h1>

        <div class="order-meta">
          <div class="meta-item"><span>Date</span><strong>{{ order()!.placedAt | date:'medium' }}</strong></div>
          <div class="meta-item"><span>Payment</span><strong>{{ order()!.paymentMethod }}</strong></div>
          <div class="meta-item"><span>Total</span><strong style="color:#e94560">\${{ order()!.totalAmount | number:'1.2-2' }}</strong></div>
        </div>

        <h3 style="margin:24px 0 12px">Items</h3>
        <table class="table">
          <thead>
            <tr><th>Product</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            @for (item of order()!.items; track item.id) {
              <tr>
                <td>{{ item.productName }}</td>
                <td>\${{ item.priceAtPurchase | number:'1.2-2' }}</td>
                <td>{{ item.quantity }}</td>
                <td><strong>\${{ item.priceAtPurchase * item.quantity | number:'1.2-2' }}</strong></td>
              </tr>
            }
          </tbody>
        </table>

        <div class="order-total-row">
          <span>Order Total</span>
          <span>\${{ order()!.totalAmount | number:'1.2-2' }}</span>
        </div>
      </div>
    }
  </div>
`,
  styles: [`
    .back-link { color: #e94560; font-size: 0.9rem; display: inline-block; margin-bottom: 4px; }
    .order-meta { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; background: #f8f8fb; border-radius: 8px; padding: 16px; }
    .meta-item { display: flex; flex-direction: column; gap: 4px; font-size: 0.9rem; }
    .meta-item span { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: .4px; }
    .order-total-row { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; padding: 14px 14px 0; color: #e94560; border-top: 2px solid #eee; margin-top: 4px; }
  `]
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrder(id).subscribe({
      next: o => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}