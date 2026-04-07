import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, ProductType, ProductFilters } from '../../core/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <h1 class="page-title">{{pageTitle()}}</h1>
      <div class="layout-sidebar">
        <!-- Filters -->
        <aside class="filter-sidebar">
          <h3>Type</h3>
          @for (t of taxonomy(); track t.id) {
            <label class="filter-check">
              <input type="radio" name="type" [value]="t.id" [(ngModel)]="filters.typeId"
                     (change)="filters.categoryId=undefined; filters.subCategoryId=undefined; applyFilters()" />
              {{t.name}}
            </label>
          }
          <label class="filter-check">
            <input type="radio" name="type" [value]="undefined" [(ngModel)]="filters.typeId"
                   (change)="filters.categoryId=undefined; filters.subCategoryId=undefined; applyFilters()" />
            All Types
          </label>

          @if (selectedType()) {
            <h3>Category</h3>
            @for (c of selectedType()!.categories; track c.id) {
              <label class="filter-check">
                <input type="radio" name="cat" [value]="c.id" [(ngModel)]="filters.categoryId"
                       (change)="filters.subCategoryId=undefined; applyFilters()" />
                {{c.name}}
              </label>
            }
          }

          @if (selectedCategory()) {
            <h3>Sub-Category</h3>
            @for (s of selectedCategory()!.subCategories; track s.id) {
              <label class="filter-check">
                <input type="radio" name="sub" [value]="s.id" [(ngModel)]="filters.subCategoryId"
                       (change)="applyFilters()" />
                {{s.name}}
              </label>
            }
          }

          <h3>Price Range</h3>
          <div class="filter-price">
            <input type="number" placeholder="Min" [(ngModel)]="filters.minPrice" min="0" />
            <span>–</span>
            <input type="number" placeholder="Max" [(ngModel)]="filters.maxPrice" min="0" />
          </div>

          <h3>Availability</h3>
          <label class="filter-check">
            <input type="checkbox" [(ngModel)]="filters.inStock" (change)="applyFilters()" />
            In stock only
          </label>

          <div class="filter-apply">
            <button class="btn btn-primary btn-full" (click)="applyFilters()">Apply Filters</button>
            <button class="btn btn-outline btn-full" style="margin-top:8px" (click)="clearFilters()">Clear</button>
          </div>
        </aside>

        <!-- Results -->
        <div>
          <div class="results-header">
            <span class="results-count">{{total()}} product{{total() !== 1 ? 's' : ''}} found</span>
            <div class="search-bar">
              <input type="text" placeholder="Search products…" [(ngModel)]="filters.search" (keydown.enter)="applyFilters()" />
              <button class="btn btn-secondary btn-sm" (click)="applyFilters()">Go</button>
            </div>
          </div>

          @if (loading()) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else if (products().length === 0) {
            <div class="empty-state"><div class="empty-icon">🔍</div><p>No products match your criteria.</p></div>
          } @else {
            <div class="product-grid">
              @for (p of products(); track p.id) {
                <div class="product-card" [routerLink]="['/product', p.id]">
                  <img [src]="imgUrl(p.imagePath)" [alt]="p.name" loading="lazy" />
                  <div class="product-card-body">
                    <h3 title="{{p.name}}">{{p.name}}</h3>
                    <div class="price">\${{p.price | number:'1.2-2'}}</div>
                    @if (p.stock === 0) { <div class="stock-out">Out of stock</div> }
                  </div>
                </div>
              }
            </div>
            <div class="pagination">
              <button [disabled]="currentPage() <= 1" (click)="goPage(currentPage()-1)">‹ Prev</button>
              @for (pg of pages(); track pg) {
                <button [class.active]="pg === currentPage()" (click)="goPage(pg)">{{pg}}</button>
              }
              <button [disabled]="currentPage() >= totalPages()" (click)="goPage(currentPage()+1)">Next ›</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .results-count { color: #888; font-size: 0.9rem; }
    .search-bar { display: flex; gap: 8px; }
    .search-bar input { padding: 7px 12px; border: 1.5px solid #ddd; border-radius: 7px; font-size: 0.9rem; width: 220px; }
    .search-bar input:focus { outline: none; border-color: #e94560; }
  `]
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  taxonomy = signal<ProductType[]>([]);
  loading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  filters: ProductFilters = { page: 1, limit: 12 };

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.productService.getTaxonomy().subscribe(t => this.taxonomy.set(t));
    this.route.queryParams.subscribe(params => {
      if (params['search']) this.filters.search = params['search'];
      if (params['typeId']) this.filters.typeId = +params['typeId'];
      if (params['categoryId']) this.filters.categoryId = +params['categoryId'];
      if (params['subCategoryId']) this.filters.subCategoryId = +params['subCategoryId'];
      this.filters.page = 1;
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts({ ...this.filters, page: this.currentPage() }).subscribe({
      next: r => {
        this.products.set(r.products);
        this.total.set(r.total);
        this.totalPages.set(r.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters() { this.currentPage.set(1); this.loadProducts(); }

  clearFilters() {
    this.filters = { page: 1, limit: 12 };
    this.currentPage.set(1);
    this.loadProducts();
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
    this.loadProducts();
    window.scrollTo(0, 0);
  }

  pages(): number[] {
    const tp = this.totalPages(), cp = this.currentPage();
    const start = Math.max(1, cp - 2), end = Math.min(tp, cp + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  imgUrl(p: string | null) { return this.productService.getImageUrl(p); }

  pageTitle(): string {
    if (this.filters.search) return `Search: "${this.filters.search}"`;
    return 'All Products';
  }

  selectedType() {
    if (!this.filters.typeId) return null;
    return this.taxonomy().find(t => t.id === this.filters.typeId) || null;
  }

  selectedCategory() {
    if (!this.filters.categoryId || !this.selectedType()) return null;
    return this.selectedType()!.categories.find(c => c.id === this.filters.categoryId) || null;
  }
}
