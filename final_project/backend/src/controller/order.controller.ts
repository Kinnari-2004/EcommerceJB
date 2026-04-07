import { Request, Response } from 'express';
import { PaymentMethod } from '../entity/Order';
import type { AuthUser } from '../middleware/auth';
import { placeOrder, getOrdersForUser, getOrderForUser } from '../service/order.service';

const VALID_PAYMENT_METHODS = Object.values(PaymentMethod);

export const checkout = async (req: Request, res: Response): Promise<void> => {
  const { paymentMethod } = req.body as Record<string, unknown>;
  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
    res.status(400).json({ error: 'Valid payment method required', options: VALID_PAYMENT_METHODS }); return;
  }
  try {
    const order = await placeOrder((req.user as AuthUser).id, paymentMethod as PaymentMethod);
    res.status(201).json(order);
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  res.json(await getOrdersForUser((req.user as AuthUser).id));
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
  const order = await getOrderForUser(id, (req.user as AuthUser).id);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
  res.json(order);
};
