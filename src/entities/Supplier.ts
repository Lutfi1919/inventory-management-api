import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./Product.ts";

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    length: 128,
  })
  name!: string;

  @OneToMany(() => Product, (product) => product.supplier)
  products!: Product[];

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
