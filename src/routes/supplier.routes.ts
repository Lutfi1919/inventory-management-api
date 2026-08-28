import { Router } from "express";
import { SupplierController } from "../controllers/supplier.controller.ts";

const router = Router();
const supplierController = new SupplierController();

router.get("/", supplierController.getAll)
router.get("/:id", supplierController.getById)
router.post("/create", supplierController.create)
router.patch("/:id", supplierController.patch)
router.delete("/:id", supplierController.delete)

export default router;