import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CartItem {
  id: number; userId: number; productId: number; quantity: number;
  product: { id: number; name: string; price: number; imagePath: string | null; stock: number; };
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();

  get total(): number {
    return this._items().reduce((s, i) => s + i.product.price * i.quantity, 0);
  }
  get count(): number {
    return this._items().reduce((s, i) => s + i.quantity, 0);
  }

  constructor(private http: HttpClient) {}

  load(): void {
    this.http.get<CartItem[]>('/api/cart').subscribe({
      next: items => this._items.set(items),
      error: () => this._items.set([])
    });
  }

  add(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post('/api/cart', { productId, quantity }).pipe(tap(() => this.load()));
  }

  updateQty(itemId: number, quantity: number): Observable<any> {
    return this.http.patch(`/api/cart/${itemId}`, { quantity }).pipe(tap(() => this.load()));
  }

  remove(itemId: number): Observable<any> {
    return this.http.delete(`/api/cart/${itemId}`).pipe(tap(() => this.load()));
  }

  clear(): void { this._items.set([]); }
}
