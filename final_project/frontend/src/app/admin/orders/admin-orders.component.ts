import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminOrder } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-page-header"><h1>All Orders</h1></div>
    @if (loading()) {
      <div class="spinner-wrap"><div class="spinner"></div></div>
    } @else if (orders().length === 0) {
      <div class="empty-state"><div class="empty-icon">🧾</div><p>No orders yet.</p></div>
    } @else {
      <div class="card" style="overflow:auto">
        <table class="table">
          <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th></th></tr></thead>
          <tbody>
            @for (o of orders(); track o.id) {
              <tr>
                <td><strong>#{{o.id}}</strong></td>
                <td>{{o.user.name}}<br><small style="color:#aaa">{{o.user.email}}</small></td>
                <td>{{o.placedAt | date:'mediumDate'}}</td>
                <td>{{o.items.length || 0}}</td>
                <td><strong>\${{o.totalAmount | number:'1.2-2'}}</strong></td>
                <td>{{o.paymentMethod}}</td>
                <td><a [routerLink]="['/admin/orders', o.id]" class="btn btn-outline btn-sm">View</a></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`.admin-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; } .admin-page-header h1 { font-size:1.5rem; font-weight:700; }`]
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<AdminOrder[]>([]);
  loading = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
