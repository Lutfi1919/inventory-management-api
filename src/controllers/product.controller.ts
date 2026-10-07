import type { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service.ts";
import { CategoryService } from "../services/category.service.ts";
import { SupplierService } from "../services/supplier.service.ts";
import { Product } from "../entities/Product.ts";
import { AppDataSource } from "../data-source.ts";
import Joi from 'joi';
import { InOut } from "../types/stock_movement.ts";
import { parseString } from "fast-csv";
import type { ProductImportRow } from "../types/product-import-row.ts";

export class ProductController {
    private productService = new ProductService();
    private categoryService = new CategoryService();
    private supplierService = new SupplierService();

    private productRepository = AppDataSource.getRepository(Product);

    getAll = async (req: Request, res: Response, next: NextFunction) => {
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

            const [data, totalData] = await this.productRepository.findAndCount();
            const totalPages = Math.ceil(totalData / limit)
            if (page > totalPages) {
                return res.status(400).json({ 
                    success: false,
                    message: `Page ${page} melebihi total page ${totalPages}` 
                })
            } 

            const products = await this.productService.getAllProduct(search, sortBy, sortOrder as 'ASC' | 'DESC', supplierId, categoryId, minPrice, maxPrice, page, limit)

            const meta = {
                page: page,
                limit: limit,
                total: totalData,
                totalPages: totalPages
            }

            return res.status(200).json({ 
                success: true,
                message: "Berhasil mengambil data", 
                data: products, 
                meta
            })
        } catch (error: any) {
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const product = await this.productService.getProductById(id)
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data Product dengan ID ${id} tidak ditemukan`
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "Berhasil mengambil data berdasarkan ID", 
                data: product
            })
        } catch (error: any) {
            next(error)
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { supplierId, categoryId, ...productData } = req.body;

            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: `Data Category dengan ID ${categoryId} tidak ditemukan`
                })
            }

            const supplier = await this.supplierService.getSupplierById(supplierId);
            if (!supplier) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data Supplier dengan ID ${supplierId} tidak ditemukan`
                })
            }

            const schema = Joi.object({
                sku: Joi.string().trim().min(5).required().messages({
                    "string.empty": "sku wajib diisi",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "sku minimal 5 karakter",
                    "any.required": "sku wajib diisi"
                }),
                name: Joi.string().trim().min(3).max(30).required().messages({
                    "string.empty": "name wajib diisi",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "name minimal 3 karakter",
                    "string.max": "name maksimal 30 karakter",
                    "any.required": "name wajib diisi"
                }),
                description: Joi.string().trim().min(3).max(60).required().messages({
                    "string.empty": "description wajib diisi",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "description minimal 3 karakter",
                    "string.max": "description maksimal 60 karakter",
                    "any.required": "description wajib diisi"
                }),
                price: Joi.number().integer().min(1).required().messages({
                    "number.empty": "price wajib diisi",
                    "number.integer": "price tidak boleh float",
                    "number.min": "price minimal seharga 1",
                    "any.required": "price wajib diisi"
                }),
                stock: Joi.number().integer().min(0).required().messages({
                    "number.empty": "stock wajib diisi",
                    "number.integer": "stock tidak boleh float",
                    "number.min": "stock minimal 0",
                    "any.required": "stock wajib diisi"
                }),
            })

            const value = await schema.validateAsync(productData)

            const product = await this.productService.createProduct(Number(supplierId), Number(categoryId), value);

            return res.status(201).json({ 
                success: true,
                message: "Berhasil membuat data Product", 
                data: product
            })
        } catch (error: any) {
            next(error)
        }
    }

    patch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            const { supplierId, categoryId, ...productData } = req.body;

            const category = await this.categoryService.getCategoryById(categoryId);
            if (!category) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data Category dengan ID ${categoryId} tidak ditemukan`,
                })
            }

            const supplier = await this.supplierService.getSupplierById(supplierId);
            if (!supplier) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data Supplier dengan ID ${supplierId} tidak ditemukan`, 
                })
            }

            const schema = Joi.object({
                sku: Joi.string().trim().min(5).required().messages({
                    "string.empty": "sku wajib diisi",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "sku minimal 5 karakter",
                    "any.required": "sku wajib diisi"
                }),
                name: Joi.string().trim().min(3).max(30).required().messages({
                    "string.empty": "name wajib diisi",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "name minimal 3 karakter",
                    "string.max": "name maksimal 30 karakter",
                    "any.required": "name wajib diisi"
                }),
                description: Joi.string().trim().min(3).max(60).required().messages({
                    "string.empty": "description wajib diisi",
                    "string.trim": "tidak boleh ada spasi diawal/akhir",
                    "string.min": "description minimal 3 karakter",
                    "string.max": "description maksimal 60 karakter",
                    "any.required": "description wajib diisi"
                }),
                price: Joi.number().integer().min(1).required().messages({
                    "number.empty": "price wajib diisi",
                    "number.integer": "price tidak boleh float",
                    "number.min": "price minimal seharga 1",
                    "any.required": "price wajib diisi"
                }),
                stock: Joi.number().integer().min(0).required().messages({
                    "number.empty": "stock wajib diisi",
                    "number.integer": "stock tidak boleh float",
                    "number.min": "stock minimal 0",
                    "any.required": "stock wajib diisi"
                }),
            })

            const value = await schema.validateAsync(productData)

            const product = await this.productService.updateProductById(id, Number(supplierId), Number(categoryId), value);
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data Product dengan ID ${id} tidak ditemukan`,
                })
            }

            return res.status(201).json({ 
                success: true,
                message: "Berhasil meng-update data Product", 
                data: product,
            })
        } catch (error: any) {
            next(error)
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            const product = await this.productService.deleteProductById(id)
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data Product dengan ID ${id} tidak ditemukan` 
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "Berhasil menghapus data Product" 
            })

        } catch (error: any) {
            next(error)
        }
    }

    updateStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            const { ...stockMovementData } = req.body 
            const product = await this.productService.getProductById(id);
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data Product dengan ID: ${id} tidak ditemukan` 
                });
            }

            const schema = Joi.object({
                type: Joi.string().valid(...Object.values(InOut)).required().messages({
                    "string.empty": "type wajib diisi",
                    "any.only": "Enum type salah",
                    "any.required": "type wajib diisi"
                }),
                quantity: Joi.number().integer().min(1).required().messages({
                    "number.empty": "quantity wajib diisi",
                    "number.integer": "quantity tidak boleh float",
                    "number.min": "quantity minimal 1",
                    "any.required": "quantity wajib diisi"
                }),
                reason: Joi.string().trim().min(3).max(30).required().messages({
                    "string.empty": "reason wajib diisi",
                    "string.min": "reason minimal 3 karakter",
                    "string.max": "reason maksimal 30 karakter",
                    "any.required": "reason wajib diisi"
                })
            })

            const value = await schema.validateAsync(stockMovementData)

            if (stockMovementData.quantity < 0) {
                return res.status(400).json({ 
                    success: false,
                    message: "quantity tidak boleh negatif" 
                })
            } else if (stockMovementData.type === "OUT" && stockMovementData.quantity > product.stock) {
                return res.status(400).json({ 
                    success: false,
                    message: `Tidak boleh mengambil stock lebih dari jumlah yang tersedia: ${product.stock}` 
                })
            }

            const stockMovement = await this.productService.updateStockById(id, value);

            return res.status(201).json({ 
                success: true,
                message: "Berhasil membuat movement stock dan mengubah stock product", 
                data: stockMovement
            })
            
            
        } catch (error: any) {
            next(error)
        }
    }

    stockHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id)
            const data = await this.productService.getStockMovementsByProductId(id);
            if (!data) {
                return res.status(404).json({ 
                    success: false,
                    message: `Data Product dengan ID: ${id} tidak ditemukan` 
                })
            }

            return res.status(200).json({ 
                success: true,
                message: "Berhasil mengambil data Stock History", 
                data 
            })
        } catch (error: any) {
            next(error)
        }
    }

    importCsv = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "File CSV wajib diupload"
                });
            }

            const expectedHeaders = [
                "sku",
                "name",
                "description",
                "price",
                "stock",
                "categoryId",
                "supplierId"
            ];

            const rows: ProductImportRow[] = [];
            let headers: string[] = [];
            let rowNumber = 1;

            parseString(req.file.buffer.toString(), {
                headers: true,
                trim: true,
                ignoreEmpty: true,
                delimiter: ";"
            })
            .on("headers", (fileHeaders) => {
                headers = fileHeaders
            })
            .on("data", (row) => {
                rowNumber++;

                rows.push({
                    rowNumber,
                    sku: row.sku,
                    name: row.name,
                    description: row.description,
                    price: Number(row.price),
                    stock: Number(row.stock),
                    categoryId: Number(row.categoryId),
                    supplierId: Number(row.supplierId)
                });
            })
            .on("end", async () => {
                try {
                    const isHeaderCorrect = headers.length === expectedHeaders.length && headers.every((header, index) => header === expectedHeaders[index]);
                    if (!isHeaderCorrect) {
                        return res.status(400).json({
                            success: false,
                            message: "Header CSV tidak sesuai",
                            expected: expectedHeaders
                        });
                    }

                    const result = await this.productService.importProducts(rows);
                    return res.status(201).json({
                        success: true,
                        ...result
                    });
                } catch (error) {
                    next(error)
                }
            })
            .on("error", (error) => {
                next(error)
            });
        } catch (error) {
            next(error);
        }
    };

    exportCsv = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const csvData = await this.productService.exportProduct();

            const fileName = `product_export_${Date.now()}.csv`; 

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

            return res.status(200).send(csvData);
        } catch (error) {
            next(error);
        }
    }
}