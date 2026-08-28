import type { Request, Response } from "express";
import { CategoryService } from "../services/category.service.ts";

export class CategoryController {
    private categoryService = new CategoryService();

    getAll = async (req: Request, res: Response) => {
        try {
            const categories = await this.categoryService.getAllCategory();
            if (!categories) {
                return res.status(400).json({ message: "data category kosong" })
            }
            return res.status(200).json({ message: "berhasil mengabil data", categories})
        } catch (error) {
            return res.status(500).json({ message: "gagal mengambil data!", error })
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const category = await this.categoryService.getCategoryById(id);
            if (!category) {
                return res.status(400).json({ message: `data category dengan ID ${id} tidak ditemukan` })
            }

            return res.status(200).json({ message: "berhasil mengambil data berdasarkan ID", category })
        } catch (error) {
            return res.status(500).json({ message: "gagal mengambil data berdasarkan ID tersebut", error })
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const category = await this.categoryService.createCategory(req.body)
            return res.status(201).json({ message: "berhasil menmbuat data", category })
        } catch (error) {
            return res.status(500).json({ message: "gagal membuat data!", error })
        }
    }

    patch = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const category = await this.categoryService.getCategoryById(id)
            if (!category) {
                return res.status(400).json({ message: `data dengan ID ${id} tidak ditemukan` })
            }

            const updatedCategory = await this.categoryService.updateCategoryById(id, req.body)
            return res.status(200).json({ message: "berhasil meng-update data", category: updatedCategory })
        } catch (error) {
            return res.status(500).json({ message: "gagal meng-update data berdasarkan ID tsb!", error })
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const category = await this.categoryService.deleteCategory(id)
            if (!category) {
                return res.status(400).json({ message: `data dengan ID ${id} tidak ditemukan` })
            }
            return res.status(201).json({ message: "berhasil menghapus data" })
        } catch (error) {
            return res.status(500).json({ message: "gagal menghapus data berdasarkan ID tsb!", error })
        }
    }
}