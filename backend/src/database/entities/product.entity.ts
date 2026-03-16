import { Type } from 'class-transformer';
import {
  ProductDetails,
  ProductDetailsTypeFn,
} from 'src/api/product/dto/productDetails';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  public code: string;

  @Column({ type: 'varchar', nullable: true })
  public title: string;

  @Column({ type: 'varchar', nullable: true })
  public variationType: string;

  @Column({ type: 'text', nullable: true })
  public description?: string | null;

  @Column({ type: 'text', array: true, default: [] })
  public about?: string[];

  @Column({ type: 'jsonb', nullable: true })
  @Type(ProductDetailsTypeFn)
  public details: Partial<ProductDetails> | null;

  @Column({ default: false })
  public isActive: boolean;

  @Column({ type: 'int', nullable: true })
  public merchantId: number;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'merchantId' })
  public merchant: User;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  public category: Category;

  @Column({ type: 'int', nullable: true })
  public categoryId: number;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}

export enum VariationTypes {
  NONE = 'NONE',
  OnlySize = 'OnlySize',
  OnlyColor = 'OnlyColor',
  SizeAndColor = 'SizeAndColor',
}

export const variationTypesKeys = Object.keys(VariationTypes);