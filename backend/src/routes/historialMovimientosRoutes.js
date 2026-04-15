const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const historialController = require('../controllers/historialMovimientosController');

router.use(verifyToken);

router.get('/', historialController.getAllHistorial);
router.get('/persona/:id_persona', historialController.getHistorialByPersona);
router.get('/export-pdf', historialController.exportHistorialPDF);
router.get('/:id', historialController.getHistorialById);
router.post('/', historialController.createHistorial);
router.delete('/:id', historialController.deleteHistorial);

module.exports = router;
