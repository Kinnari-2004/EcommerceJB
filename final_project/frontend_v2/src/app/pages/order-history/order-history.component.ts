import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <h1 class="page-title">My Orders</h1>
      @if (loading()) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <p>No orders yet.</p>
          <a routerLink="/" class="btn btn-primary" style="margin-top:16px">Start Shopping</a>
        </div>
      } @else {
        <div class="card">
          <table class="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (o of orders(); track o.id) {
                <tr>
                  <td><strong>#{{o.id}}</strong></td>
                  <td>{{o.placedAt | date:'mediumDate'}}</td>
                  <td>{{o.items.length}} item{{o.items.length !== 1 ? 's' : ''}}</td>
                  <td><strong>\${{o.totalAmount | number:'1.2-2'}}</strong></td>
                  <td>{{o.paymentMethod}}</td>
                  <td><a [routerLink]="['/orders', o.id]" class="btn btn-outline btn-sm">View</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
