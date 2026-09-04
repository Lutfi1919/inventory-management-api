import type { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category.service.ts";
import Joi from "joi";

export class CategoryController {
    private categoryService = new CategoryService();

    getAll = async (req: Request, res: Response, next: NextFunction) => {
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
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
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
            next(error)
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const schema = Joi.object({
                name: Joi.string().trim().min(3).max(30).required().messages({
                    "string.empty": "name wajib diisi",
                    "string.min": "name minimal 3 karakter",
                    "string.max": "name maksimal 30 karakter",
                    "any.required": "name wajib diisi"
                })
            })
            
            const value = await schema.validateAsync(req.body) 

            const category = await this.categoryService.createCategory(value)
            return res.status(201).json({ 
                success: true,
                message: "berhasil menmbuat data Category", 
                data: category
            })
        } catch (error: any) {
            next(error)
        }
    }

    patch = async (req: Request, res: Response, next: NextFunction) => {
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
            next(error)
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
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
            next(error)
        }
    }
}