import { Request, Response } from 'express';
import { findProducts, findFeaturedProducts, findProductById, findTaxonomy } from '../service/product.service';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { search, typeId, categoryId, subCategoryId, minPrice, maxPrice, inStock, page, limit } =
    req.query as Record<string, string | undefined>;
  const result = await findProducts({
    search,
    typeId: typeId ? +typeId : undefined,
    categoryId: categoryId ? +categoryId : undefined,
    subCategoryId: subCategoryId ? +subCategoryId : undefined,
    minPrice: minPrice ? +minPrice : undefined,
    maxPrice: maxPrice ? +maxPrice : undefined,
    inStock: inStock === 'true',
    page: page ? +page : 1,
    limit: limit ? +limit : 12,
  });
  res.json(result);
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  res.json(await findFeaturedProducts());
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
  const product = await findProductById(id);
  if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
  res.json(product);
};

export const getTaxonomy = async (_req: Request, res: Response): Promise<void> => {
  res.json(await findTaxonomy());
};
