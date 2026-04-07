import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AdminService, AdminOrder } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a routerLink="/admin/orders" class="back-link">← Back to Orders</a>
    @if (loading()) {
      <div class="spinner-wrap"><div class="spinner"></div></div>
    } @else if (order()) {
      <div class="card" style="padding:32px;margin-top:20px">
        <h2 style="margin-bottom:20px">Order #{{order()!.id}}</h2>
        <div class="detail-grid">
          <div class="meta-section">
            <h4>Customer</h4>
            <p><strong>{{order()!.user.name}}</strong></p>
            <p>{{order()!.user.email}}</p>
          </div>
          <div class="meta-section">
            <h4>Order Info</h4>
            <p>Date: {{order()!.placedAt | date:'medium'}}</p>
            <p>Payment: {{order()!.paymentMethod}}</p>
          </div>
        </div>
        <h4 style="margin:24px 0 12px">Items</h4>
        <table class="table">
          <thead><tr><th>Product</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
          <tbody>
            @for (item of order()!.items; track item.id) {
              <tr>
                <td>{{item.productName}}</td>
                <td>\${{item.priceAtPurchase | number:'1.2-2'}}</td>
                <td>{{item.quantity}}</td>
                <td><strong>\${{(item!.priceAtPurchase * item.quantity) | number:'1.2-2'}}</strong></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="order-total-row">
          <span>Order Total</span><span>\${{order()!.totalAmount | number:'1.2-2'}}</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .back-link { color:#e94560; font-size:0.9rem; display:inline-block; margin-bottom:4px; }
    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .meta-section h4 { font-size:0.78rem; text-transform:uppercase; color:#aaa; letter-spacing:.4px; margin-bottom:8px; }
    .meta-section p { font-size:0.9rem; color:#444; margin-bottom:4px; }
    .order-total-row { display:flex; justify-content:space-between; font-size:1.1rem; font-weight:800; padding:14px 14px 0; color:#e94560; border-top:2px solid #eee; margin-top:4px; }
  `]
})
export class AdminOrderDetailComponent implements OnInit {
  order = signal<AdminOrder | null>(null);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private adminService: AdminService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.adminService.getOrder(id).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
