import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../data-source';
import { Product } from '../entity/Product';
import { ProductType } from '../entity/ProductType';
import { Category } from '../entity/Category';
import { SubCategory } from '../entity/SubCategory';
import { User, UserRole } from '../entity/User';
import { Order } from '../entity/Order';
import { sessionStore } from '../store/sessionStore';

const IMAGES_DIR = path.join(__dirname, '../../ProductImages');

export async function getAllProducts(): Promise<Product[]> {
  return AppDataSource.getRepository(Product)
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.subCategory', 'subCategory')
    .leftJoinAndSelect('subCategory.category', 'category')
    .leftJoinAndSelect('category.productType', 'productType')
    .orderBy('product.id', 'DESC')
    .getMany();
}
7
export async function createProduct(data: {
  name: string; description?: string; price: number;
  stock: number; subCategoryId: number; imageFilename?: string;
}): Promise<Product> {
  const subCat = await AppDataSource.getRepository(SubCategory).findOneBy({ id: data.subCategoryId });
  if (!subCat) throw Object.assign(new Error('Sub-category not found'), { status: 400 });

  const repo = AppDataSource.getRepository(Product);
  return repo.save(repo.create({
    name: data.name,
    description: data.description || null,
    price: data.price,
    stock: data.stock,
    subCategoryId: data.subCategoryId,
    imagePath: data.imageFilename || null,
  }));
}

export async function updateProduct(
  id: number,
  data: { name?: string; description?: string; price?: number; stock?: number; subCategoryId?: number; imageFilename?: string; }
): Promise<Product> {
  const repo = AppDataSource.getRepository(Product);
  const product = await repo.findOneBy({ id });
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });

  if (data.name) product.name = data.name;
  if (data.description !== undefined) product.description = data.description || null;
  if (data.price !== undefined) product.price = data.price;
  if (data.stock !== undefined) product.stock = data.stock;
  if (data.subCategoryId) {
    const subCat = await AppDataSource.getRepository(SubCategory).findOneBy({ id: data.subCategoryId });
    if (!subCat) throw Object.assign(new Error('Sub-category not found'), { status: 400 });
    product.subCategoryId = data.subCategoryId;
  }
  if (data.imageFilename) {
    if (product.imagePath) {
      const old = path.join(IMAGES_DIR, product.imagePath);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    product.imagePath = data.imageFilename;
  }

  return repo.save(product);
}

export async function deleteProduct(id: number): Promise<void> {
  const repo = AppDataSource.getRepository(Product);
  const product = await repo.findOneBy({ id });
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });

  if (product.imagePath) {
    const img = path.join(IMAGES_DIR, product.imagePath);
    if (fs.existsSync(img)) fs.unlinkSync(img);
  }
  await repo.remove(product);
}

export async function createType(name: string): Promise<ProductType> {
  const repo = AppDataSource.getRepository(ProductType);
  return repo.save(repo.create({ name }));
}

export async function createCategory(name: string, productTypeId: number): Promise<Category> {
  const repo = AppDataSource.getRepository(Category);
  return repo.save(repo.create({ name, productTypeId }));
}

export async function createSubCategory(name: string, categoryId: number): Promise<SubCategory> {
  const repo = AppDataSource.getRepository(SubCategory);
  return repo.save(repo.create({ name, categoryId }));
}

export async function getAllCustomers(): Promise<User[]> {
  return AppDataSource.getRepository(User).find({
    where: { role: UserRole.CUSTOMER },
    select: ['id', 'name', 'email', 'isLocked', 'createdAt'],
    order: { createdAt: 'DESC' },
  });
}

export async function setCustomerLock(id: number, locked: boolean): Promise<User> {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({ id });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  user.isLocked = locked;
  await repo.save(user);
  if (locked) sessionStore.deleteAllForUser(user.id);
  return user;
}

export async function getAllOrders(): Promise<Order[]> {
  return AppDataSource.getRepository(Order)
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('order.items', 'items')
    .orderBy('order.placedAt', 'DESC')
    .getMany();
}

export async function getOrderById(id: number): Promise<Order | null> {
  return AppDataSource.getRepository(Order)
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('order.items', 'items')
    .where('order.id = :id', { id })
    .getOne();
}
