const express = require('express');
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();
const bienController = require('../controllers/bienController');
const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyToken);

router.get('/tipos', bienController.getTiposBien);
router.get('/template', bienController.downloadTemplate);
router.post('/import', upload.single('file'), bienController.importBienes);
router.get('/', bienController.getAllBienes);
router.get('/:id', bienController.getBienById);
router.post('/', bienController.createBien);
router.put('/:id', bienController.updateBien);
router.delete('/:id', bienController.deleteBien);

module.exports = router;
