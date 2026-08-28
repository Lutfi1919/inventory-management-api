import type { Request, Response } from "express";
import { SupplierService } from "../services/supplier.service.ts";

export class SupplierController {
    private supplierService = new SupplierService();

    getAll = async (req: Request, res: Response) => {
        try {
            const suppliers = await this.supplierService.getAllSupplier()
            return res.status(200).json({ message: "berhasil mengambil data", suppliers })
        } catch (error) {
            return res.status(500).json({ message: "gagal mengambil data", error })
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const supplier = await this.supplierService.getSupplierById(id)
            if (!supplier) {
                return res.status(400).json({ message: `data supplier dengan ID: ${id} not found` })
            }
            return res.status(200).json({ message: "berhasil mengambil data supplier berdasarkan ID tsb" })
        } catch (error) {
            return res.status(500).json({ message: "gagal mengambil data berdasarkan ID tsb", error })
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const supplier = await this.supplierService.createSupplier(req.body)
            return res.status(201).json({ message: "berhasil membuat data supplier", supplier })
        } catch (error) {
            return res.status(500).json({ message: "gagal membuat data", error })
        }
    }

    patch = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const supplier = await this.supplierService.getSupplierById(id)
            if (!supplier) {
                return res.status(400).json({ message: `data dengan ID ${id} tidak ditemukan` })
            }

            const updatedSupplier = await this.supplierService.updateSupplierById(id, req.body)
            return res.status(201).json({ message: `data dengan ID ${id} berhasil di update`, updatedSupplier })
        } catch (error) {
            return res.status(500).json({ message: "gagal meng-update data", error })
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const supplier = await this.supplierService.deleteSupplierById(id)
            if (!supplier) {
                return res.status(400).json({ message: `data dengan ID ${id} tidak ditemukan` })
            }
            return res.status(200).json({ message: "berhasil menghapus data" })
        } catch (error) {
            return res.status(500).json({ message: "gagal menghapus data", error })
        }
    }
}