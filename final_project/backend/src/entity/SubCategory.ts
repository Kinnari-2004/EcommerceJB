import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from './Category';
import { Product } from './Product';

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @ManyToOne(() => Category, (c) => c.subCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column({ type: 'int' })
  categoryId!: number;

  @OneToMany(() => Product, (p) => p.subCategory)
  products!: Product[];
}
