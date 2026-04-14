const ProductService = require('../services/productService');

const getAllDesplazamientos = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        const desplazamientos = await desplazamientoService.getAllDesplazamientos();
        res.status(200).json(desplazamientos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getDesplazamientoById = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        const desplazamiento = await desplazamientoService.getDesplazamientoById(req.params.id);
        if (!desplazamiento) return res.status(404).json({ message: 'Desplazamiento not found' });
        res.status(200).json(desplazamiento);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createDesplazamiento = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        const id = await desplazamientoService.createDesplazamiento(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateDesplazamiento = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        await desplazamientoService.updateDesplazamiento(req.params.id, req.body);
        res.status(200).json({ message: 'Desplazamiento updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteDesplazamiento = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        await desplazamientoService.deleteDesplazamiento(req.params.id);
        res.status(200).json({ message: 'Desplazamiento deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllDesplazamientos, getDesplazamientoById, createDesplazamiento, updateDesplazamiento, deleteDesplazamiento };
