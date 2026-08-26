import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number

    @PrimaryColumn()
    sku!: number

    @Column({

    })
    name!: string

    @Column({

    })
    description!: string

    @Column({

    })
    price!: number

    @Column({

    })
    stock!: number
}