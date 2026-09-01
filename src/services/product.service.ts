import { AppDataSource } from "../data-source.ts";
import { Product } from "../entities/Product.ts";
import { Supplier } from "../entities/Supplier.ts";
import { Category } from "../entities/Category.ts";
import { error } from "node:console";

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);
    private supplierRepository = AppDataSource.getRepository(Supplier);
    private categoryRepository = AppDataSource.getRepository(Category);

    async getAllProduct(search?: string, sortBy: string = 'createdAt', sortOrder: 'DESC' | 'ASC' = 'ASC', supplierId?: number, categoryId?: number, minPrice?: number, maxPrice?: number, page: number = 1, limit: number = 5 ) {
        const queryBuilder = this.productRepository.createQueryBuilder('product');

        queryBuilder.leftJoinAndSelect('product.supplier', 'supplier');
        queryBuilder.leftJoinAndSelect('product.category', 'category');

        if (supplierId ) {
            queryBuilder.where('product.supplierId = :supplierId', { supplierId })
        }

        if (categoryId) {
            queryBuilder.where('product.categoryId = :categoryId', { categoryId })
        }

        if (search) {
            queryBuilder.where('product.name ILIKE :search', { search: `%${search}%` });
        }

        if (minPrice) {
            queryBuilder.where('product.price > :minPrice', { minPrice })
        } else if (maxPrice) {
            queryBuilder.where('product.price < :maxPrice', { maxPrice })
        } else if (minPrice && maxPrice) {
            queryBuilder.where('product.price > :minPrice AND product.price < :maxPrice', { minPrice, maxPrice })
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
}