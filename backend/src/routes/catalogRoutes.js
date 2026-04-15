const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/motivos', verifyToken, catalogController.getMotivos);
router.get('/estados', verifyToken, catalogController.getEstados);
router.get('/tipos-documento', verifyToken, catalogController.getTiposDocumento);
router.get('/tipos-cargo', verifyToken, catalogController.getTiposCargo);

module.exports = router;