import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  PrimaryColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  OneToMany,
} from "typeorm";
import { Category } from "./Category.ts";
import { Supplier } from "./Supplier.ts";
import { StockMovement } from "./StockMovement.ts";

@Check(`"price" >= 0`)
@Check(`"stock" >= 0`)
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    unique: true,
    length: 64,
  })
  sku!: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 128,
  })
  name!: string;

  @Column({
    type: "text",
    nullable: false,
  })
  description!: string;

  @Column({
    type: "int",
    nullable: false,
  })
  price!: number;

  @Column({
    type: "int",
    nullable: false,
  })
  stock!: number;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "categoryId" })
  category!: Category;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "supplierId" })
  supplier!: Supplier;

  @OneToMany(() => StockMovement, (stockMovement) => stockMovement.product)
  stockMovements!: StockMovement[];

  @CreateDateColumn({
    type: "timestamp",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    nullable: true,
  })
  updatedAt!: Date;
}
