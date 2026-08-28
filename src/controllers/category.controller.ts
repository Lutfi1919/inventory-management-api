import type { Request, Response } from "express";
import { CategoryService } from "../service/category.service.ts";

export class CategoryController {
    private categoryService = new CategoryService();

    getAll = async (req: Request, res: Response) => {
        try {
            const categories = await this.categoryService.getAllCategory();
            res.status(200).json({ message: "berhasil mengabil data", categories})
        } catch (error) {
            res.status(500).json({ message: "gagal mengambil data!", error })
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const category = await this.categoryService.createCategory(req.body)
            res.status(201).json({ message: "berhasil menmbuat data", category })
        } catch (error) {
            res.status(500).json({ message: "gagal membuat data!", error })
        }
    }
}