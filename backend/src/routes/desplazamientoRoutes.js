const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const productController = require('../controllers/desplazamientoController');

router.use(verifyToken);

router.get('/', productController.getAllDesplazamientos);
router.get('/:id', productController.getDesplazamientoById);
router.post('/', productController.createDesplazamiento);
router.put('/:id', productController.updateDesplazamiento);
router.delete('/:id', productController.deleteDesplazamiento);

module.exports = router;
