import { AppDataSource } from '../data-source';
import { Product } from '../entity/Product';
import { ProductType } from '../entity/ProductType';

export interface ProductFilters {
  search?: string;
  typeId?: number;
  categoryId?: number;
  subCategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export async function findProducts(filters: ProductFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 12));
  const skip = (page - 1) * limit;

  const qb = AppDataSource.getRepository(Product)
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.subCategory', 'subCategory')
    .leftJoinAndSelect('subCategory.category', 'category')
    .leftJoinAndSelect('category.productType', 'productType');

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    qb.andWhere('(product.name LIKE :term OR product.description LIKE :term)', { term });
  }
  if (filters.subCategoryId) {
    qb.andWhere('subCategory.id = :subCategoryId', { subCategoryId: filters.subCategoryId });
  } else if (filters.categoryId) {
    qb.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
  } else if (filters.typeId) {
    qb.andWhere('productType.id = :typeId', { typeId: filters.typeId });
  }
  if (filters.minPrice !== undefined) qb.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
  if (filters.maxPrice !== undefined) qb.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
  if (filters.inStock) qb.andWhere('product.stock > 0');

  const [products, total] = await qb
    .orderBy('product.createdAt', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findFeaturedProducts(): Promise<Product[]> {
  return AppDataSource.getRepository(Product)
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.subCategory', 'subCategory')
    .leftJoinAndSelect('subCategory.category', 'category')
    .leftJoinAndSelect('category.productType', 'productType')
    .where('product.stock > 0')
    .orderBy('product.createdAt', 'DESC')
    .take(8)
    .getMany();
}

export async function findProductById(id: number): Promise<Product | null> {
  return AppDataSource.getRepository(Product)
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.subCategory', 'subCategory')
    .leftJoinAndSelect('subCategory.category', 'category')
    .leftJoinAndSelect('category.productType', 'productType')
    .where('product.id = :id', { id })
    .getOne();
}

export async function findTaxonomy(): Promise<ProductType[]> {
  return AppDataSource.getRepository(ProductType)
    .createQueryBuilder('t')
    .leftJoinAndSelect('t.categories', 'c')
    .leftJoinAndSelect('c.subCategories', 's')
    .orderBy('t.name')
    .addOrderBy('c.name')
    .addOrderBy('s.name')
    .getMany();
}
