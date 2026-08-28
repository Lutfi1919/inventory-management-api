import express from "express";
import type { Request, Response } from "express";
import { AppDataSource } from "./data-source.ts";
import categoryRoutes from "./routes/category.route.ts";

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

app.use("/api/category", categoryRoutes);

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
