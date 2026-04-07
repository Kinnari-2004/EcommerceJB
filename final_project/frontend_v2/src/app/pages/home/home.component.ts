import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product, ProductType } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <h1>Welcome to <span>ShopHub</span></h1>
        <p>Discover thousands of products across Electronics, Furniture, Stationery &amp; more.</p>
        <div class="hero-search">
          <input type="text" placeholder="Search products…" [(ngModel)]="searchQuery" (keydown.enter)="doSearch()" />
          <button class="btn btn-primary" (click)="doSearch()">Search</button>
        </div>
      </div>
    </section>

    <!-- Taxonomy nav -->
    <section class="taxonomy-nav container">
      <div class="type-chips">
        @for (t of taxonomy(); track t.id) {
          <button class="type-chip" (click)="browseType(t.id)">{{t.name}}</button>
        }
      </div>
    </section>

    <!-- Featured products -->
    <section class="page">
      <h2 class="page-title">Featured Products</h2>
      @if (loading()) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else {
        <div class="product-grid">
          @for (p of featured(); track p.id) {
            <div class="product-card" [routerLink]="['/product', p.id]">
              <img [src]="imgUrl(p.imagePath)" [alt]="p.name" loading="lazy" />
              <div class="product-card-body">
                <h3>{{p.name}}</h3>
                @if (p.subCategory?.category?.productType) {
                  <div class="product-card-taxonomy">{{p.subCategory!.category!.productType!.name}}</div>
                }
                <div class="price">\${{p.price | number:'1.2-2'}}</div>
                @if (p.stock === 0) { <div class="stock-out">Out of stock</div> }
              </div>
            </div>
          }
        </div>
        @if (featured().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🛍️</div>
            <p>No products yet. Check back soon!</p>
          </div>
        }
      }
    </section>
  `,
  styles: [`
    .hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: #fff; padding: 80px 24px; text-align: center; }
    .hero-inner { max-width: 640px; margin: 0 auto; }
    .hero h1 { font-size: 2.8rem; font-weight: 800; margin-bottom: 14px; line-height: 1.2; }
    .hero h1 span { color: #e94560; }
    .hero p { font-size: 1.15rem; color: #aab; margin-bottom: 32px; }
    .hero-search { display: flex; gap: 10px; max-width: 500px; margin: 0 auto; }
    .hero-search input { flex: 1; padding: 13px 16px; border-radius: 8px; border: none; font-size: 1rem; outline: none; }
    .hero-search .btn { padding: 13px 24px; font-size: 1rem; border-radius: 8px; white-space: nowrap; }
    .taxonomy-nav { padding-top: 28px; padding-bottom: 8px; }
    .type-chips { display: flex; gap: 10px; flex-wrap: wrap; }
    .type-chip { padding: 8px 20px; border-radius: 24px; border: 2px solid #1a1a2e; background: #fff; color: #1a1a2e; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all .2s; }
    .type-chip:hover { background: #1a1a2e; color: #fff; }
    .product-card-taxonomy { font-size: 0.75rem; color: #aaa; margin-bottom: 4px; }
  `]
})
export class HomeComponent implements OnInit {
  featured = signal<Product[]>([]);
  taxonomy = signal<ProductType[]>([]);
  loading = signal(true);
  searchQuery = '';

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit() {
    this.productService.getFeatured().subscribe({
      next: p => { this.featured.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.productService.getTaxonomy().subscribe(t => this.taxonomy.set(t));
  }

  imgUrl(p: string | null) { return this.productService.getImageUrl(p); }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }

  browseType(typeId: number) {
    this.router.navigate(['/products'], { queryParams: { typeId } });
  }
}
