const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialMovimientosController');

router.get('/', historialController.getAllHistorial);
router.get('/persona/:id_persona', historialController.getHistorialByPersona);
router.get('/:id', historialController.getHistorialById);
router.post('/', historialController.createHistorial);
router.delete('/:id', historialController.deleteHistorial);

module.exports = router;
