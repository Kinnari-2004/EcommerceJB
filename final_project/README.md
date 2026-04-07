# E-Commerce System — Setup Guide

## Stack
- Backend: Node.js + Express + TypeScript + TypeORM + better-sqlite3
- Frontend: Angular 17 (standalone, lazy-loaded admin)
- Auth: JWT (HTTP-only cookie) + in-memory session Map

## Quick Start

### Backend
```bash
cd backend
npm install
npm run seed     # seeds DB with admin, customer, taxonomy, 18 products
npm run dev      # http://localhost:3000
```
Seed accounts: admin@shop.com / admin123   |   customer@shop.com / customer123

### Frontend (dev)
```bash
cd frontend
npm install
npm start        # http://localhost:4200  (proxies /api → :3000)
```

### Production (single server)
```bash
cd frontend && npm run build
cd ../backend && npm run build && npm start
# Visit http://localhost:3000
```

## Security
- bcrypt (cost 12) for passwords
- JWT in HTTP-only SameSite=Strict cookie
- Every request validates cookie + in-memory session
- Account lock deletes all sessions immediately
- Rate limit: 20 req/15 min on /api/auth/*
- Parameterized queries (TypeORM QueryBuilder)
- CORS restricted to Angular dev origin

## API Routes
- POST /api/auth/register|login|logout|forgot-password|reset-password|change-password
- GET  /api/auth/me
- GET  /api/products?search=&typeId=&categoryId=&subCategoryId=&minPrice=&maxPrice=&inStock=&page=&limit=
- GET  /api/products/featured  |  /api/products/taxonomy/all  |  /api/products/:id
- GET|POST|PATCH|DELETE /api/cart  |  /api/cart/:itemId
- POST /api/orders/checkout  |  GET /api/orders  |  GET /api/orders/:id
- GET|PATCH /api/profile
- Admin (requireAdmin): /api/admin/products CRUD, /api/admin/customers, /api/admin/orders
