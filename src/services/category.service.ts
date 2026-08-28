import { AppDataSource } from "../data-source.ts";
import { Category } from "../entities/Category.ts";

export class CategoryService {
    private categoryRepository = AppDataSource.getRepository(Category);

    async getAllCategory() {
        return await this.categoryRepository.find();
    }

    async getCategoryById(id: number) {
        return await this.categoryRepository.findOneBy({ id })
    }

    async createCategory(categoryData: Category) {
        const newCategory = this.categoryRepository.create(categoryData);
        return await this.categoryRepository.save(newCategory);
    }

    async updateCategoryById(id: number, categoryData: Category) {
        const category = await this.categoryRepository.preload({
            ...categoryData,
            id,
        });

        if (!category) {
            return null;
        }

        return await this.categoryRepository.save(category);
    }

    async deleteCategory(id: number) {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            return null
        }
        return await this.categoryRepository.delete({ id })
    }

}