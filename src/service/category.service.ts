import { AppDataSource } from "../data-source.ts";
import { Category } from "../entities/Category.ts";

export class CategoryService {
  private get categoryRepository() {
    return AppDataSource.getRepository(Category);
  }

  async getAllCategory() {
    return await this.categoryRepository.find();
  }

  async getCategoryById(id: number) {
    return await this.categoryRepository.findOneBy({ id });
  }

  async createCategory(categoryData: Category) {
    const newCategory = this.categoryRepository.create(categoryData);
    return await this.categoryRepository.save(newCategory);
  }

  async updateCategoryById(id: number, categoryData: Category) {
    const newCategory = this.categoryRepository.update({ id }, categoryData);
  }

  async deleteCategory(id: number) {
    return await this.categoryRepository.delete({ id });
  }
}
