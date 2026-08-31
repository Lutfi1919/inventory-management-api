import { AppDataSource } from "../data-source.ts";
import { Product } from "../entities/Product.ts";
import { Supplier } from "../entities/Supplier.ts";
import { Category } from "../entities/Category.ts";

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);
    private supplierRepository = AppDataSource.getRepository(Supplier);
    private categoryRepository = AppDataSource.getRepository(Category);

    async getAllProduct() {
        return await this.productRepository.find({
            relations: {
                supplier: true,
                category: true,
            },
        });
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