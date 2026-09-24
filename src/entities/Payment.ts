import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { PaymentMethod, PaymentStatus } from "../types/payment_types.ts";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 64,
        unique: true
    })
    reference_key!: string;

    @Column({
        type: "varchar",
        length: 64,
        nullable: false,
        unique: true
    })
    trx_id!: string;

    @Column({
        type: "enum",
        enum: PaymentMethod,
        nullable: false
    })
    method!: PaymentMethod;

    @Column({
        type: "int",
        nullable: false
    })
    amount!: number;

    @Column({
        nullable: false,
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status!: PaymentStatus

    @CreateDateColumn({
        type: "timestamp"
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: "timestamp",
        nullable: true
    })
    updatedAt!: Date;
}