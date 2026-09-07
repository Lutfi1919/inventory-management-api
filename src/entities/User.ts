import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../types/users_roles.ts";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        nullable: false,
        length: 64,
    })
    name!: string;

    @Column({
        type: "varchar",
        nullable: false,
        unique: true,
        length: 64
    })
    email!: string;

    @Column({
        type: "varchar",
        nullable: false,
        length: 64,
        select: false
    })
    password!: string;

    @Column({
        nullable: false,
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

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