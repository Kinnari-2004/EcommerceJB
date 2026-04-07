import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ProductType } from './ProductType';
import { SubCategory } from './SubCategory';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @ManyToOne(() => ProductType, (t) => t.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productTypeId' })
  productType!: ProductType;

  @Column({ type: 'int' })
  productTypeId!: number;

  @OneToMany(() => SubCategory, (s) => s.category)
  subCategories!: SubCategory[];
}
