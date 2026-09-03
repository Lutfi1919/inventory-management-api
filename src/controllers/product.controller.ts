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
                return res.status(400).json({ 
                    success: false,
                    message: `page ${page} melebihi total page ${totalPages}` 
                })
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
                success: true,
                message: "berhasil mengambil data", 
                data, 
                meta
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
            const data = await this.productService.getProductById(id)
            if (!data) {
                return res.status(400).json({ 
                    success: false,
                    message: `data product dengan ID ${id} tidak ditemukan`
                 })
            }

            return res.status(200).json({ 
                success: true,
                message: "berhasil mengambil data berdasarkan ID", data
             })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "gagal mengambil data!", 
                error: error.message
             })
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const { supplierId, categoryId, ...productData } = req.body;

            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: `data category dengan ID ${categoryId} tidak ditemukan`
                })
            }

            const supplier = await this.supplierService.getSupplierById(supplierId);
            if (!supplier) {
                return res.status(404).json({ 
                    success: false,
                    message: `data supplier dengan ID ${supplierId} tidak ditemukan`
                })
            }

            const data = await this.productService.createProduct(Number(supplierId), Number(categoryId), productData);

            return res.status(201).json({ 
                success: true,
                message: "berhasil membuat data product", data
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "gagal membuat data produk!", 
                error: error.message
            })
        }
    }

    patch = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const { supplierId, categoryId, ...productData } = req.body;

            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                return res.status(404).json({ 
                    success: false,
                    message: `data category dengan ID ${categoryId} tidak ditemukan`,
                })
            }

            const supplier = await this.supplierService.getSupplierById(supplierId);
            if (!supplier) {
                return res.status(404).json({ 
                    success: false,
                    message: `data supplier dengan ID ${supplierId} tidak ditemukan`, 
                })
            }

            const product = await this.productService.updateProductById(id, Number(supplierId), Number(categoryId), productData);
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `data dengan ID ${id} tidak ditemukan`,
                })
            }

            const data = product

            return res.status(201).json({ 
                success: true,
                message: "berhasil meng-updte data product", data,
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "gagal meng-update data produk!", 
                error: error.message
            })
        }
    }

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const product = await this.productService.deleteProductById(id)
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `data dengan ID ${id} tidak ditemukan` 
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "berhasil menghapus produk" 
            })

        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "gagal menghapus data produk!", 
                error: error.message 
            })
        }
    }

    updateStock = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const { ...stockMovementData } = req.body 
            const product = await this.productService.getProductById(id);
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `product dengan ID: ${id} tidak ditemukan` 
                });
            }

            if (stockMovementData.quantity < 0) {
                return res.status(400).json({ 
                    success: false,
                    message: "quantity tidak boleh negatif" 
                })
            } else if (stockMovementData.type === "OUT" && stockMovementData.quantity > product.stock) {
                return res.status(400).json({ 
                    success: false,
                    message: `tidak boleh mengambil stock lebih dari jumlah yang tersedia: ${product.stock}` 
                })
            }

            const stockMovement = await this.productService.updateStockById(id, stockMovementData);
            const data = stockMovement

            return res.status(201).json({ 
                success: true,
                message: "berhasil membuat movement stock dan mengubah stock product", 
                data
            })
            
            
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "gagal meng-update data stock produk!", 
                error: error.message 
            })
        }
    }

    stockHistory = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id)
            const data = await this.productService.getStockMovementsByProductId(id);
            if (!data) {
                return res.status(404).json({ 
                    success: false,
                    message: `product dengan ID: ${id} tidak ditemukan` 
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "berhasil mengambil data", 
                data 
            })
        } catch (error: any) {
            return res.status(500).json({ 
                success: false,
                message: "gagal mengambiil data stock-history produk!", 
                error: error.message 
            })
        }
    }
}