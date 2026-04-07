import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './data-source';
import './passport';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
// import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import profileRoutes from './routes/profile';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// ── Security headers ──────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── CORS (Angular dev server on :4200) ───────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowed = isDev ? ['http://localhost:4200', `http://localhost:${PORT}`] : [`http://localhost:${PORT}`];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

// ── Body parsers & cookie ─────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// ── Rate limiting on auth endpoints ──────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// ── Static files ──────────────────────────────────────────────────────────────
// Product images
app.use('/ProductImages', express.static(path.join(__dirname, '../ProductImages')));
// Angular build output (in production)
const angularDist = path.join(__dirname, '../../frontend/dist/frontend/browser');
app.use(express.static(angularDist));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
AppDataSource.initialize()
  .then(() => {
    console.log('Database ready');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
