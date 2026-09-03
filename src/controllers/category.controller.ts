import type { Request, Response } from "express";
import { CategoryService } from "../services/category.service.ts";

export class CategoryController {
    private categoryService = new CategoryService();

    getAll = async (req: Request, res: Response) => {
        try {
            const categories = await this.categoryService.getAllCategory();
            if (!categories) {
                return res.status(400).json({ 
                    success: false,
                    message: "data category kosong" 
                })
            }
            return res.status(200).json({ 
                success: true,
                message: "berhasil mengabil data", 
                data: categories
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "gagal mengambil data!", 
                error: error.message 
            })
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const category = await this.categoryService.getCategoryById(id);
            if (!category) {
                return res.status(400).json({ 
                    success: false,
                    message: `data category dengan ID ${id} tidak ditemukan` 
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "berhasil mengambil data berdasarkan ID", 
                data: category 
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: true,
                message: "gagal mengambil data berdasarkan ID tersebut", 
                error: error.message 
            })
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const category = await this.categoryService.createCategory(req.body)
            return res.status(201).json({ 
                success: true,
                message: "berhasil menmbuat data category", 
                data: category
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "gagal membuat data!", 
                error: error.message 
            })
        }
    }

    patch = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const updatedCategory = await this.categoryService.updateCategoryById(id, req.body)
            if (!updatedCategory) {
                return res.status(400).json({ 
                    success: false,
                    message: `data dengan ID ${id} tidak ditemukan` 
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "berhasil meng-update data", 
                data: updatedCategory 
            })
        } catch (error) {
            return res.status(500).json({ message: "gagal meng-update data berdasarkan ID tsb!", error })
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const category = await this.categoryService.deleteCategory(id)
            if (!category) {
                return res.status(400).json({ 
                    success: false,
                    message: `data dengan ID ${id} tidak ditemukan` 
                })
            }
            return res.status(201).json({ 
                success: true,
                message: "berhasil menghapus data" 
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: true,
                message: "gagal menghapus data berdasarkan ID tsb!", 
                error: error.message 
            })
        }
    }
}