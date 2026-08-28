import { Router } from "express";
import { CategoryController } from "../controllers/category.controller.ts";

const router = Router();
const categoryController = new CategoryController();

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/create", categoryController.create);
router.patch("/:id", categoryController.patch);
router.delete("/:id", categoryController.delete);

export default router;