import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "./data-source.ts";
import categoryRoutes from "./routes/category.routes.ts";
import supplierRoutes from "./routes/supplier.routes.ts";
import productRoutes from "./routes/product.routes.ts";
import userRoutes from "./routes/user.routes.ts";
import { errorHandler } from "./middlewares/error-handler.ts";
import { checkToken } from "./middlewares/auth.ts";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Service is running",
  });
});

app.use("/api/category", checkToken, categoryRoutes);
app.use("/api/supplier", checkToken, supplierRoutes);
app.use("/api/product", checkToken, productRoutes);
app.use("/api/auth", userRoutes);

app.use(errorHandler)

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
