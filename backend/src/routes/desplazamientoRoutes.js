const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const desplazamientoController = require('../controllers/desplazamientoController');

router.use(verifyToken);

router.get('/', desplazamientoController.getAllDesplazamientos);
router.get('/:id', desplazamientoController.getDesplazamientoById);
router.post('/', desplazamientoController.createDesplazamiento);
router.put('/:id/status', desplazamientoController.updateDesplazamientoStatus);
router.put('/:id/cancel', desplazamientoController.cancelDesplazamiento);
router.put('/:id', desplazamientoController.updateDesplazamiento);
router.delete('/:id', desplazamientoController.deleteDesplazamiento);

module.exports = router;
