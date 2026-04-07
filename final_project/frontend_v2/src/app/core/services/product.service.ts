import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductType { id: number; name: string; categories: Category[]; }
export interface Category { id: number; name: string; subCategories: SubCategory[]; productTypeId: number; }
export interface SubCategory { id: number; name: string; categoryId: number; }
export interface Product {
  id: number; name: string; description: string | null; price: number; stock: number;
  imagePath: string | null; subCategoryId: number | null; createdAt: string;
  subCategory?: SubCategory & { category?: Category & { productType?: ProductType } };
}

export interface ProductsResponse {
  products: Product[]; total: number; page: number; limit: number; totalPages: number;
}

export interface ProductFilters {
  search?: string; typeId?: number; categoryId?: number; subCategoryId?: number;
  minPrice?: number; maxPrice?: number; inStock?: boolean; page?: number; limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<ProductsResponse>('/api/products', { params });
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products/featured');
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  getTaxonomy(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>('/api/products/taxonomy/all');
  }

  getImageUrl(imagePath: string | null): string {
    if (!imagePath) return '/assets/placeholder.png';
    return `/ProductImages/${imagePath}`;
  }
}
