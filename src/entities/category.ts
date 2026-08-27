import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany } from "typeorm"
import { Product } from "./product.js"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true })    
    name!: string

    @OneToMany(() => Product, (product) => product.category)
    products!: Product[]
}