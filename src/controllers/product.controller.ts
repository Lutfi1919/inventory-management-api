import type { Request, Response } from "express";
import { ProductService } from "../services/product.service.ts";
import { CategoryService } from "../services/category.service.ts";
import { SupplierService } from "../services/supplier.service.ts";
import { Product } from "../entities/Product.ts";
import { AppDataSource } from "../data-source.ts";

export class ProductController {
    private productService = new ProductService();
    private categoryService = new CategoryService();
    private supplierService = new SupplierService();

    private productRepository = AppDataSource.getRepository(Product);

    getAll = async (req: Request, res: Response) => {
        try {
            const search = req.query.search as string
            const sortBy = req.query.sortBy as string
            let sortOrder = (req.query.sortOrder as string || 'ASC').toUpperCase();

            const supplierId = Number(req.query.supplierId)
            const categoryId = Number(req.query.categoryId)

            const minPrice = Number(req.query.minPrice)
            const maxPrice = Number(req.query.maxPrice)

            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 5

            const [datas, totalData] = await this.productRepository.findAndCount();
            const totalPages = Math.ceil(totalData / limit)
            if (page > totalPages) {
                return res.status(400).json({ message: `page ${page} melebihi total page ${totalPages}` })
            } 

            const products = await this.productService.getAllProduct(search, sortBy, sortOrder as 'ASC' | 'DESC', supplierId, categoryId, minPrice, maxPrice, page, limit)

            const meta = {
                page: page,
                limit: limit,
                total: totalData,
                totalPages: totalPages
            }

            const data = products;

            return res.status(200).json({ 
                message: "berhasil mengambil data", 
                data, 
                meta
            })
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

    updateStock = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const { ...stockMovementData } = req.body 
            const product = await this.productService.getProductById(id);
            if (!product) {
                return res.status(404).json({ message: `product dengan ID: ${id} tidak ditemukan` });
            }

            if (stockMovementData.quantity < 0) {
                return res.status(400).json({ message: "quantity tidak boleh negatif" })
            } else if (stockMovementData.type === "OUT" && stockMovementData.quantity > product.stock) {
                return res.status(400).json({ message: `tidak boleh mengambil stock lebih dari jumlah yang tersedia: ${product.stock}` })
            }

            const stockMovement = await this.productService.updateStockById(id, stockMovementData);
            const data = stockMovement

            return res.status(201).json({ message: "berhasil membuat movement stock dan mengubah stock product", data})
            
            
        } catch (error) {
            return res.status(500).json({ message: "gagal meng-update data stock produk!", error })
        }
    }

    stockHistory = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const product = await this.productService.getStockMovementsByProductId(id);
            if (!product) {
                return res.status(404).json({ message: `product dengan ID: ${id} tidak ditemukan` })
            }

            return res.status(200).json({ message: "berhasil mengambil data", product })
        } catch (error) {
            return res.status(500).json({ message: "gagal mengambiil data stock-history produk!", error })
        }
    }
}