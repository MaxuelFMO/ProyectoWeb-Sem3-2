const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.use(verifyToken);

router.get('/motivos', catalogController.getMotivos);
router.get('/estados', catalogController.getEstados);
router.get('/tipos-documento', catalogController.getTiposDocumento);
router.get('/tipos-cargo', catalogController.getTiposCargo);

module.exports = router;