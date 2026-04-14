const ProductService = require('../services/productService');

const getAllProducts = async (req, res) => {
    try {
        const productService = new ProductService(req.app.get('db'));
        const products = await productService.getAllProducts();
        res.status(200).json(Array.isArray(products) ? products : []);
    } catch (err) {
        console.error('getAllProducts error:', err);
        res.status(200).json([]);
    }
};

const getProductById = async (req, res) => {
    try {
        const productService = new ProductService(req.app.get('db'));
        const product = await productService.getProductById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const productService = new ProductService(req.app.get('db'));
        const id = await productService.createProduct(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productService = new ProductService(req.app.get('db'));
        await productService.updateProduct(req.params.id, req.body);
        res.status(200).json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productService = new ProductService(req.app.get('db'));
        await productService.deleteProduct(req.params.id);
        res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
