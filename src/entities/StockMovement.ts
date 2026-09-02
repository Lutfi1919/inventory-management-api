import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product.ts";
import { InOut } from "../types/stock_movement.ts";

@Entity()
export class StockMovement {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Product, (product) => product.stockMovements, {
        nullable: false,
        onDelete: "RESTRICT"
    })
    @JoinColumn({ name: "productId" })
    product!: Product;

    @Column({
        nullable: false,
        type: "enum",
        enum: InOut
    })
    type!: InOut;

    @Column({
        type: "int",
        nullable: false
    })
    quantity!: number;

    @Column({
    type: "text",
    nullable: false,
    })
    reason!: string;
}