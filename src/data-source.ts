import "reflect-metadata";
import { DataSource } from "typeorm";
import { Category } from "./entities/Category.ts";
import { Supplier } from "./entities/Supplier.ts";
import { Product } from "./entities/Product.ts";
import { StockMovement } from "./entities/StockMovement.ts";
import { User } from "./entities/User.ts";
import { Payment } from "./entities/Payment.ts";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME ?? "postgres",
  password: process.env.DB_PASSWORD ?? "1234",
  database: process.env.DB_DATABASE ?? "inventory_management",
  entities: [Category, Supplier, Product, StockMovement, User, Payment],
  migrations: ["src/migrations/**/*{.ts,.js}"],
});
