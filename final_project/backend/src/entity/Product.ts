import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { SubCategory } from './SubCategory';
import { CartItem } from './CartItem';
import { OrderItem } from './OrderItem';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true, default: null })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  imagePath!: string | null;

  @ManyToOne(() => SubCategory, (s) => s.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subCategoryId' })
  subCategory!: SubCategory | null;

  @Column({ type: 'int', nullable: true, default: null })
  subCategoryId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => CartItem, (c) => c.product)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (o) => o.product)
  orderItems!: OrderItem[];
}
