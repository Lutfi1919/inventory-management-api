import { Router } from "express";
import { ProductController } from "../controllers/product.controller.ts";

const router = Router();
const productController = new ProductController();

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/create", productController.create);
router.patch("/:id", productController.patch);
router.delete("/:id", productController.delete);

router.post('/:id/stock', productController.updateStock);
router.get('/:id/stock-history', productController.stockHistory);

export default router;