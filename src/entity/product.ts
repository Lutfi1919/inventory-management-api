import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, PrimaryColumn, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Category } from "./category.js"
import { Supplier } from "./supplier.js"

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    id!: number

    @PrimaryColumn()
    sku!: number

    @Column({
        nullable: false,
        length: 128
    })
    name!: string

    @Column({
        nullable: false,
        length: 128
    })
    description!: string

    @Column({
        type: "int",
        nullable: false
    })
    price!: number

    @Column({
        type: "int",
        nullable: false
    })
    stock!: number

    @ManyToOne(() => Category, (category) => category.products, { onDelete: "CASCADE" })
    @JoinColumn({ name: "categoryId" })
    categoryId!: Category

    @ManyToOne(() => Supplier, (supplier) => supplier.products, { onDelete: "CASCADE" })
    @JoinColumn({ name: "supplierId" })
    supplierId!: Supplier

    @Column()
	@CreateDateColumn()
	createdAt!: Date

    @Column({ nullable: true })
    @UpdateDateColumn()
    updatedAt!: Date
}