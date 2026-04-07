import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (loading()) {
      <div class="spinner-wrap"><div class="spinner"></div></div>
    } @else if (product()) {
      <div class="page">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a routerLink="/">Home</a><span>/</span>
          @if (product()!.subCategory?.category?.productType) {
            <a [routerLink]="['/products']" [queryParams]="{typeId: product()!.subCategory!.category!.productType!.id}">
              {{product()!.subCategory!.category!.productType!.name}}
            </a><span>/</span>
            <a [routerLink]="['/products']" [queryParams]="{categoryId: product()!.subCategory!.category!.id}">
              {{product()!.subCategory!.category!.name}}
            </a><span>/</span>
            <a [routerLink]="['/products']" [queryParams]="{subCategoryId: product()!.subCategory!.id}">
              {{product()!.subCategory!.name}}
            </a><span>/</span>
          }
          <span style="color:#222">{{product()!.name}}</span>
        </nav>

        <div class="detail-layout">
          <div class="detail-image card">
            <img [src]="imgUrl(product()!.imagePath)" [alt]="product()!.name" />
          </div>
          <div class="detail-info">
            <h1 class="detail-title">{{product()!.name}}</h1>
            <div class="detail-price">\${{product()!.price | number:'1.2-2'}}</div>
            <div class="detail-stock" [class.out]="product()!.stock === 0">
              {{product()!.stock > 0 ? product()!.stock + ' in stock' : 'Out of stock'}}
            </div>

            @if (product()!.description) {
              <p class="detail-desc">{{product()!.description}}</p>
            }

            @if (successMsg()) {
              <div class="alert alert-success">{{successMsg()}}</div>
            }
            @if (errorMsg()) {
              <div class="alert alert-error">{{errorMsg()}}</div>
            }

            <div class="detail-actions">
              @if (auth.isCustomer()) {
                <div class="qty-row">
                  <label>Qty:</label>
                  <input type="number" [(ngModel)]="qty" min="1" [max]="product()!.stock" />
                </div>
                <button class="btn btn-primary" [disabled]="product()!.stock === 0 || adding()" (click)="addToCart()">
                  {{adding() ? 'Adding…' : 'Add to Cart'}}
                </button>
              } @else if (!auth.isLoggedIn()) {
                <p class="login-prompt"><a routerLink="/login">Log in</a> to add this item to your cart.</p>
              }

              <button class="btn btn-outline" (click)="share()">🔗 Share</button>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="page"><div class="empty-state"><div class="empty-icon">❌</div><p>Product not found.</p></div></div>
    }
  `,
  styles: [`
    .detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
    @media (max-width: 700px) { .detail-layout { grid-template-columns: 1fr; } }
    .detail-image { overflow: hidden; border-radius: 12px; }
    .detail-image img { width: 100%; height: 380px; object-fit: cover; display: block; }
    .detail-title { font-size: 1.7rem; font-weight: 700; margin-bottom: 10px; }
    .detail-price { font-size: 2rem; font-weight: 800; color: #e94560; margin-bottom: 8px; }
    .detail-stock { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; background: #d4edda; color: #155724; margin-bottom: 16px; }
    .detail-stock.out { background: #fde8ec; color: #b02a37; }
    .detail-desc { color: #555; line-height: 1.7; margin-bottom: 24px; }
    .detail-actions { display: flex; flex-direction: column; gap: 12px; max-width: 300px; }
    .qty-row { display: flex; align-items: center; gap: 10px; }
    .qty-row input { width: 70px; padding: 8px; border: 1.5px solid #ddd; border-radius: 7px; font-size: 1rem; }
    .login-prompt { font-size: 0.9rem; color: #666; }
    .login-prompt a { color: #e94560; font-weight: 500; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  adding = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  qty = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public auth: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProduct(id).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  imgUrl(p: string | null) { return this.productService.getImageUrl(p); }

  addToCart() {
    if (!this.product()) return;
    this.adding.set(true);
    this.cartService.add(this.product()!.id, this.qty).subscribe({
      next: () => {
        this.adding.set(false);
        this.successMsg.set('Added to cart!');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.adding.set(false);
        this.errorMsg.set(err?.error?.error || 'Failed to add to cart');
        setTimeout(() => this.errorMsg.set(''), 3000);
      }
    });
  }

  share() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'));
    } else {
      prompt('Copy this link:', url);
    }
  }
}
