import { AppDataSource } from "../data-source.ts";
import { Supplier } from "../entities/Supplier.ts";

export class SupplierService {
    private supplierRepository = AppDataSource.getRepository(Supplier);

    async getAllSupplier() {
        return await this.supplierRepository.find();
    }

    async getSupplierById(id: number) {
        return await this.supplierRepository.findOneBy({ id })
    }

    async createSupplier(supplierData: Supplier) {
        const newSupplier = this.supplierRepository.create(supplierData);
        return await this.supplierRepository.save(newSupplier);
    }

    async updateSupplierById(id: number, supplierData: Supplier) {
        const supplier = await this.supplierRepository.preload({ 
            ...supplierData,
            id
        });

        if (!supplier) {
            return null
        }

        return await this.supplierRepository.save(supplier);
    }

    async deleteSupplierById(id: number) {
        const supplier = await this.supplierRepository.findOneBy({ id });
        if (!supplier) {
            return null
        }
        return await this.supplierRepository.delete({id})
    }
}