import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Product } from "./Product.js"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ 
        type: "varchar",
        unique: true ,
        length: 128
    })    
    name!: string

    @OneToMany(() => Product, (product) => product.category)
    products!: Product[]
    
    @CreateDateColumn({
        type: "timestamp"
    })
    createdAt!: Date

    @UpdateDateColumn({
        type: "timestamp",
        nullable: true
    })
    updatedAt!: Date
}