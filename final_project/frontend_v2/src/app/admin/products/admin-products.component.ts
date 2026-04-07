import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ProductService, ProductType } from '../../core/services/product.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-header">
      <h1>Products</h1>
      <button class="btn btn-primary" (click)="openForm()">+ Add Product</button>
    </div>

    @if (formOpen()) {
      <div class="modal-backdrop" (click)="closeForm()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>{{editing ? 'Edit Product' : 'New Product'}}</h3>
          @if (formError()) { <div class="alert alert-error">{{formError()}}</div> }
          
          <div class="form-group"><label>Name *</label>
            <input type="text" [(ngModel)]="form.name" />
          </div>
          
          <div class="form-group"><label>Description</label>
            <textarea [(ngModel)]="form.description"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group"><label>Price *</label>
              <input type="number" [(ngModel)]="form.price" min="0" step="0.01" />
            </div>
            <div class="form-group"><label>Stock</label>
              <input type="number" [(ngModel)]="form.stock" min="0" />
            </div>
          </div>

          <div class="form-group"><label>Sub-Category *</label>
            <select [(ngModel)]="form.subCategoryId">
              <option value="">Select...</option>
              @for (t of taxonomy(); track t.id) {
                <optgroup [label]="t.name">
                  @for (c of t.categories; track c.id) {
                    @for (s of c.subCategories; track s.id) {
                      <option [value]="s.id">{{t.name}} > {{c.name}} > {{s.name}}</option>
                    }
                  }
                </optgroup>
              }
            </select>
          </div>

          <div class="form-group"><label>Image</label>
            <input type="file" accept="image/*" (change)="onFile($event)" />
            @if (editing?.imagePath) {
              <div style="margin-top:8px">
                <img [src]="imgUrl(editing!.imagePath)" style="height:60px;border-radius:6px" />
                <small>Current image</small>
              </div>
            }
          </div>

          <div style="display:flex;gap:10px;margin-top:8px">
            <button class="btn btn-primary" [disabled]="saving()" (click)="saveProduct()">
              {{saving() ? 'Saving...' : 'Save'}}
            </button>
            <button class="btn btn-outline" (click)="closeForm()">Cancel</button>
          </div>
        </div>
      </div>
    }

    @if (loading()) {
      <div class="spinner-wrap"><div class="spinner"></div></div>
    } @else {
      <div class="card" style="overflow:auto">
        <table class="table">
          <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Sub-Category</th><th>Actions</th></tr></thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr>
                <td><img [src]="imgUrl(p.imagePath)" style="width:44px;height:44px;object-fit:cover;border-radius:6px" /></td>
                <td><strong>{{p.name}}</strong></td>
                <td>\${{p.price | number:'1.2-2'}}</td>
                <td>
                  <span class="badge-pill" [class.badge-success]="p.stock > 0" [class.badge-danger]="p.stock === 0">
                    {{p.stock}}
                  </span>
                </td>
                <td style="font-size:0.82rem;color:#888">
                  {{p.subCategory?.category?.productType?.name}} > {{p.subCategory?.category?.name}} > {{p.subCategory?.name}}
                </td>
                <td>
                  <button class="btn btn-outline btn-sm" style="margin-right:6px" (click)="openForm(p)">Edit</button>
                  <button class="btn btn-danger btn-sm" (click)="deleteProduct(p.id)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .admin-page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .admin-page-header h1 { font-size: 1.5rem; font-weight: 700; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 200; }
    .modal-box { background: #fff; border-radius: 12px; padding: 32px; width: 540px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 40px rgba(0,0,0,.2); }
    .modal-box h3 { font-size: 1.2rem; margin-bottom: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  `]
})
export class AdminProductsComponent implements OnInit {
  products = signal<any[]>([]);
  taxonomy = signal<ProductType[]>([]);
  loading = signal(true);
  formOpen = signal(false);
  saving = signal(false);
  formError = signal('');
  editing: any = null;
  selectedFile: File | null = null;
  form = { name: '', description: '', price: 0, stock: 0, subCategoryId: '' };

  constructor(private adminService: AdminService, private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
    this.productService.getTaxonomy().subscribe(t => this.taxonomy.set(t));
  }

  loadProducts() {
    this.loading.set(true);
    this.adminService.getProducts().subscribe({
      next: p => { this.products.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(product?: any) {
    this.editing = product || null;
    this.formError.set('');
    this.selectedFile = null;
    this.form = product
      ? { name: product.name, description: product.description || '', price: product.price, stock: product.stock, subCategoryId: product.subCategoryId || '' }
      : { name: '', description: '', price: 0, stock: 0, subCategoryId: '' };
    this.formOpen.set(true);
  }

  closeForm() { this.formOpen.set(false); this.editing = null; }

  onFile(e: Event) {
    this.selectedFile = (e.target as HTMLInputElement).files?.[0] || null;
  }

  saveProduct() {
    if (!this.form.name || !this.form.price || !this.form.subCategoryId) {
      this.formError.set('Name, price, and sub-category are required.'); return;
    }
    this.saving.set(true); this.formError.set('');
    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('description', this.form.description);
    fd.append('price', String(this.form.price));
    fd.append('stock', String(this.form.stock));
    fd.append('subCategoryId', String(this.form.subCategoryId));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const req$ = this.editing
      ? this.adminService.updateProduct(this.editing.id, fd)
      : this.adminService.createProduct(fd);

    req$.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.loadProducts(); },
      error: (err: any) => { this.saving.set(false); this.formError.set(err?.error?.error || 'Save failed'); }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    this.adminService.deleteProduct(id).subscribe(() => this.loadProducts());
  }

  imgUrl(p: string | null) { return this.productService.getImageUrl(p); }
}
