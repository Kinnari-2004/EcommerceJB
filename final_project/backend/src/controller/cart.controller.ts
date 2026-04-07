// import { Request, Response } from 'express';
// import type { AuthUser } from '../middleware/auth';
// import {
//   getCartForUser, addOrUpdateCartItem,
//   updateCartItemQty, removeCartItem, clearCartForUser,
// } from '../service/cart.service';

// export const getCart = async (req: Request, res: Response): Promise<void> => {
//   res.json(await getCartForUser((req.user as AuthUser).id));
// };

// export const addToCart = async (req: Request, res: Response): Promise<void> => {
//   const { productId, quantity } = req.body as Record<string, unknown>;
//   const pid = Number(productId), qty = Number(quantity);
//   if (!pid || isNaN(pid) || qty < 1) {
//     res.status(400).json({ error: 'Valid productId and quantity (>=1) required' }); return;
//   }
//   try {
//     const item = await addOrUpdateCartItem((req.user as AuthUser).id, pid, qty);
//     res.json({ message: 'Cart updated', item });
//   } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
// };

// export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
//   const qty = Number(req.body.quantity);
//   if (isNaN(qty) || qty < 1) { res.status(400).json({ error: 'Quantity must be >= 1' }); return; }
//   try {
//     const item = await updateCartItemQty(
//       (req.user as AuthUser).id,
//       parseInt(req.params['itemId'] as string, 10),
//       qty
//     );
//     res.json({ message: 'Quantity updated', item });
//   } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
// };

// export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
//   try {
//     await removeCartItem((req.user as AuthUser).id, parseInt(req.params['itemId'] as string, 10));
//     res.json({ message: 'Item removed' });
//   } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
// };

// export const clearCart = async (req: Request, res: Response): Promise<void> => {
//   await clearCartForUser((req.user as AuthUser).id);
//   res.json({ message: 'Cart cleared' });
// };
