import { Request, Response } from 'express';
import {
  getAllProducts, createProduct, updateProduct, deleteProduct,
  createType, createCategory, createSubCategory,
  getAllCustomers, setCustomerLock,
  getAllOrders, getOrderById,
} from '../service/admin.service';

export const adminGetAllProducts = async (_req: Request, res: Response): Promise<void> => {
  res.json(await getAllProducts());
};

export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, stock, subCategoryId } = req.body as Record<string, string>;
  if (!name?.trim() || !price || !subCategoryId) {
    res.status(400).json({ error: 'name, price, and subCategoryId are required' }); return;
  }
  try {
    const product = await createProduct({
      name: name.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      stock: parseInt(stock || '0', 10),
      subCategoryId: parseInt(subCategoryId, 10),
      imageFilename: req.file?.filename,
    });
    res.status(201).json(product);
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};

export const adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  const { name, description, price, stock, subCategoryId } = req.body as Record<string, string>;
  try {
    const product = await updateProduct(id, {
      name: name?.trim(),
      description,
      price: price ? parseFloat(price) : undefined,
      stock: stock !== undefined ? parseInt(stock, 10) : undefined,
      subCategoryId: subCategoryId ? parseInt(subCategoryId, 10) : undefined,
      imageFilename: req.file?.filename,
    });
    res.json(product);
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};

export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteProduct(parseInt(req.params['id'] as string, 10));
    res.json({ message: 'Product deleted' });
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};

export const adminCreateType = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body as Record<string, string>;
  if (!name?.trim()) { res.status(400).json({ error: 'Name required' }); return; }
  res.status(201).json(await createType(name.trim()));
};

export const adminCreateCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, productTypeId } = req.body as Record<string, string>;
  if (!name?.trim() || !productTypeId) {
    res.status(400).json({ error: 'name and productTypeId required' }); return;
  }
  res.status(201).json(await createCategory(name.trim(), parseInt(productTypeId, 10)));
};

export const adminCreateSubCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, categoryId } = req.body as Record<string, string>;
  if (!name?.trim() || !categoryId) {
    res.status(400).json({ error: 'name and categoryId required' }); return;
  }
  res.status(201).json(await createSubCategory(name.trim(), parseInt(categoryId, 10)));
};

export const adminGetAllCustomers = async (_req: Request, res: Response): Promise<void> => {
  res.json(await getAllCustomers());
};

export const adminToggleLockCustomer = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  const { locked } = req.body as { locked: boolean };
  try {
    const user = await setCustomerLock(id, !!locked);
    res.json({ message: locked ? 'Account locked' : 'Account unlocked', isLocked: user.isLocked });
  } catch (e: any) { res.status(e.status || 500).json({ error: e.message }); }
};

export const adminGetAllOrders = async (_req: Request, res: Response): Promise<void> => {
  res.json(await getAllOrders());
};

export const adminGetOrderById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  const order = await getOrderById(id);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
  res.json(order);
};
