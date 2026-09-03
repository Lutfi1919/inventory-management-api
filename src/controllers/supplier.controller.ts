import type { Request, Response } from "express";
import { SupplierService } from "../services/supplier.service.ts";

export class SupplierController {
    private supplierService = new SupplierService();

    getAll = async (req: Request, res: Response) => {
        try {
            const suppliers = await this.supplierService.getAllSupplier()
            return res.status(200).json({ 
                success: true,
                message: "berhasil mengambil data",
                data: suppliers
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
            return res.status(500).json({ 
                success: true,
                message: "Internal server error", 
                error: error.message 
            })
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const supplier = await this.supplierService.createSupplier(req.body)
            return res.status(201).json({ 
                success: true,
                message: "berhasil membuat data supplier", 
                data: supplier 
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
            const updatedSupplier = await this.supplierService.updateSupplierById(id, req.body)
            if (!updatedSupplier) {
                return res.status(404).json({ 
                    success: false,
                    message: `data dengan ID ${id} tidak ditemukan` 
                })
            }
            return res.status(201).json({ 
                success: true,
                message: `data dengan ID ${id} berhasil di update`,
                data: updatedSupplier 
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "Internal server error", 
                error: error.message 
            })
        }
    }

    delete = async (req: Request, res: Response) => {
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
            return res.status(500).json({ 
                success: false,
                message: "Internal server error", 
                error: error.message 
            })
        }
    }
}