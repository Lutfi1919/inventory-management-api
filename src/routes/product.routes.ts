import { Router } from "express";
import { ProductController } from "../controllers/product.controller.ts";
import { requireRole } from "../middlewares/auth.ts";

const router = Router();
const productController = new ProductController();

router.get("/", requireRole("admin", "user", "manager"), productController.getAll);
router.get("/:id", requireRole("admin", "user", "manager"), productController.getById);
router.post("/create", requireRole("admin", "manager"), productController.create);
router.patch("/:id", requireRole("admin", "manager"), productController.patch);
router.delete("/:id", requireRole("admin", "user"), productController.delete);

router.post('/:id/stock', requireRole("admin", "manager"), productController.updateStock);
router.get('/:id/stock-history', requireRole("admin", "user"), productController.stockHistory);

export default router;