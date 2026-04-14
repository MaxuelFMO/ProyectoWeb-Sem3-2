const express = require('express');
const router = express.Router();
const bienController = require('../controllers/bienController');

router.get('/', bienController.getAllBienes);
router.get('/:id', bienController.getBienById);
router.post('/', bienController.createBien);
router.put('/:id', bienController.updateBien);
router.delete('/:id', bienController.deleteBien);

module.exports = router;
