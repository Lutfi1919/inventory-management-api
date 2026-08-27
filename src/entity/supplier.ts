import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany } from "typeorm"
import { Product } from "./product.js"

@Entity()
export class Supplier {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @OneToMany(() => Product, (product) => product.supplierId)
    products!: Product[]
}