const DesplazamientoService = require('../services/desplazamientoService');

const getAllDesplazamientos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        const desplazamientos = await desplazamientoService.getAllDesplazamientos(req.user.id);
        
        const filtered = desplazamientos.slice(offset, offset + limit);
        res.status(200).json({
            data: Array.isArray(filtered) ? filtered : [],
            total: desplazamientos.length,
            page,
            limit
        });
    } catch (err) {
        console.error('getAllDesplazamientos error:', err);
        res.status(200).json({ data: [], total: 0, page: 1, limit: 10 });
    }
};

const getDesplazamientoById = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        const desplazamiento = await desplazamientoService.getDesplazamientoById(req.params.id, req.user.id);
        if (!desplazamiento) return res.status(404).json({ message: 'Desplazamiento not found' });
        res.status(200).json(desplazamiento);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createDesplazamiento = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        const id = await desplazamientoService.createDesplazamiento(req.body, req.user.id);
        res.status(201).json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateDesplazamiento = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        await desplazamientoService.updateDesplazamiento(req.params.id, req.body, req.user.id);
        res.status(200).json({ message: 'Desplazamiento updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateDesplazamientoStatus = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        await desplazamientoService.updateDesplazamiento(req.params.id, req.body, req.user.id);
        res.status(200).json({ message: 'Estado de desplazamiento actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteDesplazamiento = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        await desplazamientoService.deleteDesplazamiento(req.params.id, req.user.id);
        res.status(200).json({ message: 'Desplazamiento deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const cancelDesplazamiento = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        await desplazamientoService.updateDesplazamiento(req.params.id, { id_estado: 4 }, req.user.id); // 4 = Cancelado
        res.status(200).json({ message: 'Desplazamiento cancelado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllDesplazamientos,
    getDesplazamientoById,
    createDesplazamiento,
    updateDesplazamiento,
    updateDesplazamientoStatus,
    deleteDesplazamiento,
    cancelDesplazamiento,
};
