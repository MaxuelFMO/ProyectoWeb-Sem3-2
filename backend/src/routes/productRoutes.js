const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const productController = require('../controllers/productController');

router.use(verifyToken);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
