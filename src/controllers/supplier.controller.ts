import type { NextFunction, Request, Response } from "express";
import { SupplierService } from "../services/supplier.service.ts";
import Joi from "joi";

export class SupplierController {
    private supplierService = new SupplierService();

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const suppliers = await this.supplierService.getAllSupplier()
            return res.status(200).json({ 
                success: true,
                message: "berhasil mengambil data",
                data: suppliers
            })
        } catch (error: any) {
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            const supplier = await this.supplierService.getSupplierById(id)
            if (!supplier) {
                return res.status(404).json({ 
                    success: false,
                    message: `data Supplier dengan ID: ${id} not found` 
                })
            }
            return res.status(200).json({ 
                success: true,
                message: "berhasil mengambil data Supplier berdasarkan ID", 
                data: supplier 
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
            
            const supplier = await this.supplierService.createSupplier(value)

            return res.status(201).json({ 
                success: true,
                message: "berhasil membuat data supplier", 
                data: supplier 
            })
        } catch (error: any) {
            next(error)
        }
    }

    patch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            
            let supplier = await this.supplierService.getSupplierById(id)
            if (!supplier) {
                return res.status(404).json({ 
                    success: false,
                    message: `data dengan ID ${id} tidak ditemukan` 
                })
            }
            
            const schema = Joi.object({
                name: Joi.string().trim().min(3).max(30).required().messages({
                    "string.empty": "name wajib diisi",
                    "string.min": "name minimal 3 karakter",
                    "string.max": "name maksimal 30 karakter",
                    "any.required": "name wajib diisi"
                })
            })

            const value = await schema.validateAsync(req.body)

            supplier = await this.supplierService.updateSupplierById(id, value)
            
            return res.status(201).json({ 
                success: true,
                message: `data dengan ID ${id} berhasil di update`,
                data: supplier 
            })
        } catch (error: any) {
            next(error)
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            const supplier = await this.supplierService.deleteSupplierById(id)
            if (!supplier) {
                return res.status(404).json({ 
                    success: false,
                    message: `data Supplier dengan ID: ${id} tidak ditemukan` 
                })
            }
            return res.status(200).json({ 
                success: true,
                message: "berhasil menghapus data Supplier berdasarkan ID" 
            })
        } catch (error: any) {
            next(error)
        }
    }
}