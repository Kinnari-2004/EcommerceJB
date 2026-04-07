import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminOrderItem {
  id: number;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface AdminOrder {
  id: number;
  placedAt: string;
  paymentMethod: string;
  totalAmount: number;
  items: AdminOrderItem[];
  user: { id: number; name: string; email: string };
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  isLocked: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>('/api/admin/products');
  }

  createProduct(fd: FormData): Observable<any> {
    return this.http.post<any>('/api/admin/products', fd);
  }

  updateProduct(id: number, fd: FormData): Observable<any> {
    return this.http.patch<any>(`/api/admin/products/${id}`, fd);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`/api/admin/products/${id}`);
  }

  getCustomers(): Observable<AdminCustomer[]> {
    return this.http.get<AdminCustomer[]>('/api/admin/customers');
  }

  setLock(id: number, locked: boolean): Observable<any> {
    return this.http.patch(`/api/admin/customers/${id}/lock`, { locked });
  }

  getOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>('/api/admin/orders');
  }

  getOrder(id: number): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`/api/admin/orders/${id}`);
  }
}
