import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  id: number;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface Order {
  id: number;
  placedAt: string;
  paymentMethod: string;
  totalAmount: number;
  items: OrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  checkout(paymentMethod: string): Observable<Order> {
    return this.http.post<Order>('/api/orders/checkout', { paymentMethod });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders');
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${id}`);
  }
}
