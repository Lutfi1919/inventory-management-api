import { Router } from "express";
import { ProductController } from "../controllers/product.controller.ts";
import { requireRole } from "../middlewares/auth.ts";

const router = Router();
const productController = new ProductController();

router.get("/", requireRole("ADMIN", "USER", "MANAGER"), productController.getAll);
router.get("/:id", requireRole("ADMIN", "USER", "MANAGER"), productController.getById);
router.post("/create", requireRole("ADMIN", "MANAGER"), productController.create);
router.patch("/:id", requireRole("ADMIN", "MANAGER"), productController.patch);
router.delete("/:id", requireRole("ADMIN", "USER"), productController.delete);

router.post('/:id/stock', requireRole("ADMIN", "MANAGER"), productController.updateStock);
router.get('/:id/stock-history', requireRole("ADMIN", "USER"), productController.stockHistory);

export default router;