import { AppDataSource } from "../data-source.ts";
import { Product } from "../entities/Product.ts";
import { Supplier } from "../entities/Supplier.ts";
import { Category } from "../entities/Category.ts";
import { StockMovement } from "../entities/StockMovement.ts";
import type { ProductImportRow } from "../types/product-import-row.ts";
import type { ImportError } from "../types/product-import-row.ts";
import { writeToString } from "fast-csv";

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);
    private supplierRepository = AppDataSource.getRepository(Supplier);
    private categoryRepository = AppDataSource.getRepository(Category);

    async getAllProduct(search?: string, sortBy: string = 'createdAt', sortOrder: 'DESC' | 'ASC' = 'ASC', supplierId?: number, categoryId?: number, minPrice?: number, maxPrice?: number, page: number = 1, limit: number = 5 ) {
        const queryBuilder = this.productRepository.createQueryBuilder('product');

        queryBuilder.leftJoinAndSelect('product.supplier', 'supplier');
        queryBuilder.leftJoinAndSelect('product.category', 'category');

        if (supplierId && !isNaN(supplierId)) {
            queryBuilder.where('product.supplierId = :supplierId', { supplierId });
        }

        if (categoryId && !isNaN(categoryId)) {
            queryBuilder.where('product.categoryId = :categoryId', { categoryId });
        }
        
        if (search) {
            queryBuilder.where('product.name ILIKE :search', { search: `%${search}%` });
        }

        if (minPrice && maxPrice) {
            queryBuilder.where('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
        } else if (maxPrice) {
            queryBuilder.where('product.price < :maxPrice', { maxPrice })
        } else if (minPrice) {
            queryBuilder.where('product.price > :minPrice', { minPrice })
        }

        const offset = (page - 1) * limit

        if (limit) {
            queryBuilder.limit(limit).offset(offset)
        }
        
        const columns = ['sku', 'name', 'price', 'categoryId', 'supplierId','createdAt'];
        const targetColumn = columns.includes(sortBy) ? sortBy : 'createdAt';

        queryBuilder.orderBy(`product.${targetColumn}`, sortOrder)

        return await queryBuilder.getMany();
    }

    async getProductById(id: number) {
        return await this.productRepository.findOne({ 
            where: { id },
            relations: {
                supplier: true,
                category: true
            }
        })
    }

    async createProduct(supplierId: number, categoryId: number, productData: Product) {
        const supplier = await this.supplierRepository.findOneBy({ id: supplierId })
        if (!supplier) {
            return null
        }

        const category = await this.categoryRepository.findOneBy({ id: categoryId })
        if (!category) {
            return null
        }

        const newProduct = this.productRepository.create({
            ...productData,
            supplier,
            category,
        })

        return await this.productRepository.save(newProduct)
    }

    async updateProductById(id: number, supplierId: number, categoryId: number, productData: Product) {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            return null;
        }

        const supplier = await this.supplierRepository.findOneBy({ id: supplierId })
        if (!supplier) {
            return null
        }

        const category = await this.categoryRepository.findOneBy({ id: categoryId })
        if (!category) {
            return null
        }

        const updatedProduct = await this.productRepository.preload({
            ...productData,
            id,
            supplier,
            category,
        })

        if (!updatedProduct) {
            return null;
        }

        return await this.productRepository.save(updatedProduct)
    }

    async deleteProductById(id: number) {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            return null
        }

        return await this.productRepository.delete({id})    
    }

    async updateStockById(id: number, movementData: StockMovement) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const product = await transactionalEntityManager.findOneBy(Product, {id});
            if (!product) {
                return null;
            }
    
            if (movementData.type === "IN") {
                product.stock += movementData.quantity
            } else if (movementData.type === "OUT") {
                product.stock -= movementData.quantity
            }
    
            const updatedProduct = await transactionalEntityManager.save(product);
    
            const newStockMovement = transactionalEntityManager.create(StockMovement, {
                ...movementData,
                product: updatedProduct
            })
    
            return await transactionalEntityManager.save(newStockMovement);
        })
    }

    async getStockMovementsByProductId(productId: number) {
        return await this.productRepository.findOne({ 
            where: { id: productId },
            relations: {stockMovements: true}
        });
    }

    async importProducts(rows: ProductImportRow[]) {
        const errors: ImportError[] = [];
        
        const validProducts: Product[] = [];
        const skuList: string[] = [];

        for (const row of rows) {
            try {
                if (!row.sku || !row.name || !row.description) {
                    throw new Error("sku, name, dan description wajib diisi");
                }
    
                if (skuList.includes(row.sku)) {
                    throw new Error(`SKU duplikat di CSV: ${row.sku}`);
                }
    
                skuList.push(row.sku);
    
                if (!Number.isInteger(row.price) || row.price < 1) {
                    throw new Error(`price tidak valid pada SKU ${row.sku}`);
                }
    
                if (!Number.isInteger(row.stock) || row.stock < 0) {
                    throw new Error(`stock tidak valid pada SKU ${row.sku}`);
                }
    
                const category = await this.categoryRepository.findOneBy({ id: row.categoryId });
                if (!category) {
                    throw new Error(`category ${row.categoryId} tidak ditemukan`);
                }
    
                const supplier = await this.supplierRepository.findOneBy({ id: row.supplierId });
                if (!supplier) {
                    throw new Error(`supplier ${row.supplierId} tidak ditemukan`);
                }
    
                const existingProduct = await this.productRepository.findOneBy({
                    sku: row.sku
                });
                if (existingProduct) {
                    throw new Error(`SKU sudah terdaftar: ${row.sku}`);
                }

                const product = this.productRepository.create({
                    sku: row.sku,
                    name: row.name,
                    description: row.description,
                    price: row.price,
                    stock: row.stock,
                    category,
                    supplier
                });

                validProducts.push(product);
            } catch (error: any) {
                errors.push({
                    row: row.rowNumber,
                    message: error.message
                });
            }
        }

        const createImportError = (message: string) => {
            const error = new Error(message) as Error & { statusCode: number };
            error.statusCode = 400;
            return error;
        };

        if (validProducts.length > 0) {
            await this.productRepository.save(validProducts);

            return {
                total: rows.length,
                successCount: validProducts.length,
                failedCount: errors.length,
                errors
            }
        } else {
            throw createImportError("tidak ada data yang valid untuk diimpor");
        }

    }

    async exportProduct() {
        const products = await this.productRepository.find({
            relations: {
                supplier: true,
                category: true
            }
        });

        const formattedData = products.map((product) => ({
            sku: product.sku,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: product.category.id,
            supplierId: product.supplier.id
        }));

        const csvString = await writeToString(formattedData, {
            headers: true,
            delimiter: ";"
        });

        return csvString;
    }
}