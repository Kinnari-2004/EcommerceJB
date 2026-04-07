// import { AppDataSource } from '../data-source';
// import { CartItem } from '../entity/CartItem';
// import { Product } from '../entity/Product';

// export async function getCartForUser(userId: number): Promise<CartItem[]> {
//   return AppDataSource.getRepository(CartItem)
//     .createQueryBuilder('cart')
//     .leftJoinAndSelect('cart.product', 'product')
//     .where('cart.userId = :userId', { userId })
//     .getMany();
// }

// export async function addOrUpdateCartItem(userId: number, productId: number, quantity: number): Promise<CartItem> {
//   const product = await AppDataSource.getRepository(Product).findOneBy({ id: productId });
//   if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
//   if (product.stock < 1) throw Object.assign(new Error('Product is out of stock'), { status: 400 });

//   const repo = AppDataSource.getRepository(CartItem);
//   let item = await repo.findOneBy({ userId, productId });

//   if (item) {
//     item.quantity = Math.min(quantity, product.stock);
//   } else {
//     item = repo.create({ userId, productId, quantity: Math.min(quantity, product.stock) });
//   }
//   return repo.save(item);
// }

// export async function updateCartItemQty(userId: number, itemId: number, quantity: number): Promise<CartItem> {
//   const repo = AppDataSource.getRepository(CartItem);
//   const item = await repo.findOne({ where: { id: itemId, userId }, relations: ['product'] });
//   if (!item) throw Object.assign(new Error('Cart item not found'), { status: 404 });

//   item.quantity = Math.min(quantity, item.product.stock);
//   return repo.save(item);
// }

// export async function removeCartItem(userId: number, itemId: number): Promise<void> {
//   const repo = AppDataSource.getRepository(CartItem);
//   const item = await repo.findOneBy({ id: itemId, userId });
//   if (!item) throw Object.assign(new Error('Cart item not found'), { status: 404 });
//   await repo.remove(item);
// }

// export async function clearCartForUser(userId: number): Promise<void> {
//   await AppDataSource.getRepository(CartItem).delete({ userId });
// }
