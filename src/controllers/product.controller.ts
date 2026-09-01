import type { Request, Response } from "express";
import { ProductService } from "../services/product.service.ts";
import { CategoryService } from "../services/category.service.ts";
import { SupplierService } from "../services/supplier.service.ts";

export class ProductController {
    private productService = new ProductService();
    private categoryService = new CategoryService();
    private supplierService = new SupplierService();

    getAll = async (req: Request, res: Response) => {
        try {
            const search = req.query.search as string
            const sortBy = req.query.sortBy as string

            const rawSupplierId = req.query.supplierId
            const supplierId = Number(rawSupplierId)

            const rawcategoryId = req.query.categoryId
            const categoryId = Number(rawcategoryId)

            const rawMinPrice = req.query.minPrice
            const minPrice = Number(rawMinPrice)

            const rawMaxPrice = req.query.maxPrice
            const maxPrice = Number(rawMaxPrice)

            let sortOrder = (req.query.sortOrder as string || 'ASC').toUpperCase();

            const products = await this.productService.getAllProduct(search, sortBy, sortOrder as 'ASC' | 'DESC', supplierId, categoryId, minPrice, maxPrice)

            return res.status(200).json({ message: "berhasil mengambil data", products })
        } catch (error: any) {
            return res.status(500).json({ message: "gagal mengambil data!", error: error.message })
        }
    }

    getById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const product = await this.productService.getProductById(id)
            if (!product) {
                return res.status(400).json({ message: `data product dengan ID ${id} tidak ditemukan` })
            }

            return res.status(200).json({ message: "berhasil mengambil data berdasarkan ID", product })
        } catch (error) {
            return res.status(500).json({ message: "gagal mengambil data!", error })
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const { supplierId, categoryId, ...productData } = req.body;

            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                return res.status(404).json({ message: `data category dengan ID ${categoryId} tidak ditemukan` })
            }

            const supplier = await this.supplierService.getSupplierById(supplierId);
            if (!supplier) {
                return res.status(404).json({ message: `data supplier dengan ID ${supplierId} tidak ditemukan` })
            }

            const product = await this.productService.createProduct(Number(supplierId), Number(categoryId), productData);

            return res.status(201).json({ message: "berhasil membuat data product", product })
        } catch (error) {
            return res.status(500).json({ message: "gagal membuat data produk!", error })
        }
    }

    patch = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const { supplierId, categoryId, ...productData } = req.body;

            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                return res.status(404).json({ message: `data category dengan ID ${categoryId} tidak ditemukan` })
            }

            const supplier = await this.supplierService.getSupplierById(supplierId);
            if (!supplier) {
                return res.status(404).json({ message: `data supplier dengan ID ${supplierId} tidak ditemukan` })
            }

            const product = await this.productService.updateProductById(id, Number(supplierId), Number(categoryId), productData);
            if (!product) {
                return res.status(404).json({ message: `data dengan ID ${id} tidak ditemukan` })
            }

            return res.status(201).json({ message: "berhasil meng-updte data product", product })
        } catch (error) {
            return res.status(500).json({ message: "gagal meng-update data produk!", error })
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const product = await this.productService.deleteProductById(id)
            if (!product) {
                return res.status(404).json({ message: `data dengan ID ${id} tidak ditemukan` })
            }

            return res.status(200).json({ message: "berhasil menghapus produk" })
        } catch (error) {
            return res.status(500).json({ message: "gagal menghapus data produk!", error })
        }
    }
}