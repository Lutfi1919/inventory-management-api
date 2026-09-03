import type { Request, Response } from "express";
import { CategoryService } from "../services/category.service.ts";

export class CategoryController {
    private categoryService = new CategoryService();

    getAll = async (req: Request, res: Response) => {
        try {
            const categories = await this.categoryService.getAllCategory();
            if (!categories) {
                return res.status(404).json({ 
                    success: false,
                    message: "data Category tidak ditemukan" 
                })
            }
            return res.status(200).json({ 
                success: true,
                message: "berhasil mengambil data Categories", 
                data: categories
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "Internal server error", 
                error: error.message 
            })
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const category = await this.categoryService.getCategoryById(id);
            if (!category) {
                return res.status(404).json({ 
                    success: false,
                    message: `data category dengan ID ${id} tidak ditemukan` 
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "berhasil mengambil data Category berdasarkan ID", 
                data: category 
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: true,
                message: "Internal server error", 
                error: error.message 
            })
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const category = await this.categoryService.createCategory(req.body)
            return res.status(201).json({ 
                success: true,
                message: "berhasil menmbuat data Category", 
                data: category
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "Internal server error", 
                error: error.message 
            })
        }
    }

    patch = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const updatedCategory = await this.categoryService.updateCategoryById(id, req.body)
            if (!updatedCategory) {
                return res.status(404).json({ 
                    success: false,
                    message: `data dengan ID ${id} tidak ditemukan` 
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "berhasil meng-update data Category", 
                data: updatedCategory 
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "Internal server", 
                error: error.message 
            })
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const category = await this.categoryService.deleteCategory(id)
            if (!category) {
                return res.status(404).json({ 
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
                message: "Internal server error", 
                error: error.message 
            })
        }
    }
}