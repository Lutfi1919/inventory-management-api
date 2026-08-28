import { Router } from "express";
import { CategoryController } from "../controllers/category.controller.ts";

const router = Router();
const categoryController = new CategoryController();

router.get("/", categoryController.getAll);
router.post("/create", categoryController.create);

export default router;