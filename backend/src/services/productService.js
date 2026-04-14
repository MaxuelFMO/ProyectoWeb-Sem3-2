const ProductModel = require('../models/productModel');

class ProductService {
    constructor(db) {
        this.productModel = new ProductModel(db);
    }

    async getAllProducts() {
        return await this.productModel.findAll();
    }

    async getProductById(id) {
        return await this.productModel.findById(id);
    }

    async createProduct(productData) {
        return await this.productModel.create(productData);
    }

    async updateProduct(id, productData) {
        return await this.productModel.update(id, productData);
    }

    async deleteProduct(id) {
        return await this.productModel.delete(id);
    }
}

module.exports = ProductService;
