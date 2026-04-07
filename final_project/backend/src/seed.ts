import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from './data-source';
import { User, UserRole } from './entity/User';
import { ProductType } from './entity/ProductType';
import { Category } from './entity/Category';
import { SubCategory } from './entity/SubCategory';
import { Product } from './entity/Product';
import bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected. Seeding...');

  // ── Users ────────────────────────────────────────────────────────────────
  const userRepo = AppDataSource.getRepository(User);
  const adminExists = await userRepo.findOneBy({ email: 'admin@shop.com' });
  if (!adminExists) {
    await userRepo.save(userRepo.create({
      name: 'Admin',
      email: 'admin@shop.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: UserRole.ADMIN,
    }));
    console.log('Admin created: admin@shop.com / admin123');
  }

  const customerExists = await userRepo.findOneBy({ email: 'customer@shop.com' });
  if (!customerExists) {
    await userRepo.save(userRepo.create({
      name: 'Kinnari Vaghela',
      email: 'kinnari.vaghela@example.com',
      passwordHash: await bcrypt.hash('customer123', 12),
      role: UserRole.CUSTOMER,
    }));
    console.log('Customer created: kinnari.vaghela@example.com / kinnari123');
  }

  // ── Taxonomy & Products ──────────────────────────────────────────────────
  const typeRepo = AppDataSource.getRepository(ProductType);
  const catRepo = AppDataSource.getRepository(Category);
  const subRepo = AppDataSource.getRepository(SubCategory);
  const prodRepo = AppDataSource.getRepository(Product);

  const taxonomyData = [
    {
      type: 'Electronics',
      categories: [
        {
          name: 'Computer Peripherals',
          subs: [
            { name: 'Keyboards', products: [
              { name: 'Anker Multimedia Keyboard', description: 'Full-size wireless keyboard with multimedia keys.', price: 29.99, stock: 50 },
              { name: 'Mechanical Gaming Keyboard', description: 'RGB backlit mechanical keyboard with blue switches.', price: 79.99, stock: 30 },
            ]},
            { name: 'Mice', products: [
              { name: 'Logitech Wireless Mouse', description: 'Ergonomic wireless mouse with long battery life.', price: 24.99, stock: 45 },
              { name: 'Gaming Mouse 12000 DPI', description: 'High-precision gaming mouse with adjustable DPI.', price: 49.99, stock: 20 },
            ]},
          ],
        },
        {
          name: 'Audio',
          subs: [
            { name: 'Headphones', products: [
              { name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling headphones.', price: 349.99, stock: 15 },
              { name: 'Budget Over-Ear Headphones', description: 'Comfortable stereo headphones for everyday use.', price: 19.99, stock: 60 },
            ]},
          ],
        },
      ],
    },
    {
      type: 'Furniture',
      categories: [
        {
          name: 'Living Room',
          subs: [
            { name: 'Tables', products: [
              { name: 'Wooden Coffee Table', description: 'Solid oak coffee table, minimalist design.', price: 199.99, stock: 8 },
              { name: 'Glass Side Table', description: 'Tempered glass side table with chrome legs.', price: 89.99, stock: 12 },
            ]},
            { name: 'Sofas', products: [
              { name: 'Three-Seater Fabric Sofa', description: 'Comfortable grey fabric sofa, modern style.', price: 599.99, stock: 5 },
            ]},
          ],
        },
        {
          name: 'Office',
          subs: [
            { name: 'Desks', products: [
              { name: 'Standing Desk 140cm', description: 'Electric height-adjustable standing desk.', price: 449.99, stock: 10 },
              { name: 'Computer Desk', description: 'Compact wooden computer desk with cable management.', price: 129.99, stock: 18 },
            ]},
          ],
        },
      ],
    },
    {
      type: 'Stationery',
      categories: [
        {
          name: 'Kids',
          subs: [
            { name: 'Textbooks', products: [
              { name: 'Multiplication Table Book', description: 'Colourful multiplication table learning book for kids.', price: 7.99, stock: 100 },
              { name: 'Science Activity Book Grade 5', description: 'Hands-on science activities for ages 10–11.', price: 12.99, stock: 75 },
            ]},
          ],
        },
        {
          name: 'Writing',
          subs: [
            { name: 'Pens & Pencils', products: [
              { name: 'Premium Ballpoint Pen Set', description: 'Set of 12 smooth-writing ballpoint pens.', price: 9.99, stock: 200 },
              { name: 'Mechanical Pencils Pack', description: '0.5mm mechanical pencils, pack of 6.', price: 5.99, stock: 150 },
            ]},
            { name: 'Notebooks', products: [
              { name: 'A5 Ruled Notebook', description: '200-page ruled notebook, hardcover.', price: 6.99, stock: 120 },
              { name: 'Dot Grid Journal', description: 'Bullet journal with dot grid pages.', price: 14.99, stock: 80 },
            ]},
          ],
        },
      ],
    },
  ];

  for (const typeData of taxonomyData) {
    let typeEntity = await typeRepo.findOneBy({ name: typeData.type });
    if (!typeEntity) {
      typeEntity = await typeRepo.save(typeRepo.create({ name: typeData.type }));
    }

    for (const catData of typeData.categories) {
      let catEntity = await catRepo.findOneBy({ name: catData.name, productTypeId: typeEntity.id });
      if (!catEntity) {
        catEntity = await catRepo.save(catRepo.create({ name: catData.name, productTypeId: typeEntity.id }));
      }

      for (const subData of catData.subs) {
        let subEntity = await subRepo.findOneBy({ name: subData.name, categoryId: catEntity.id });
        if (!subEntity) {
          subEntity = await subRepo.save(subRepo.create({ name: subData.name, categoryId: catEntity.id }));
        }

        for (const prodData of subData.products) {
          const exists = await prodRepo.findOneBy({ name: prodData.name });
          if (!exists) {
            await prodRepo.save(prodRepo.create({
              name: prodData.name,
              description: prodData.description,
              price: prodData.price,
              stock: prodData.stock,
              subCategoryId: subEntity.id,
            }));
          }
        }
      }
    }
  }

  console.log('Seed complete.');
  await AppDataSource.destroy();
}

seed().catch(err => { console.error(err); process.exit(1); });
