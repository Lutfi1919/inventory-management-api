export type ProductImportRow = {
    rowNumber: number;
    sku: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
    supplierId: number;
};

export type ImportError = {
    row: number;
    message: string;
}