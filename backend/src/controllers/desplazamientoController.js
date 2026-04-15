const DesplazamientoService = require('../services/desplazamientoService');

const getAllDesplazamientos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const displacementService = new DesplazamientoService(req.app.get('db'));
        const isAdmin = req.user.id_tipo_cargo === 1;

        const filters = {
            id_persona: req.query.id_persona,
            id_motivo: req.query.id_motivo,
            id_estado: req.query.id_estado,
            fecha_inicio: req.query.fecha_inicio,
            fecha_fin: req.query.fecha_fin,
            search: req.query.search
        };

        const desplazamientos = await displacementService.getAllDesplazamientos(req.user.id, isAdmin, filters);
        
        // Calcular estadísticas sobre el total filtrado
        const stats = desplazamientos.reduce((acc, d) => {
            const estado = d.estado || 'Desconocido';
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});

        const paginated = desplazamientos.slice(offset, offset + limit);

        res.status(200).json({
            data: paginated,
            total: desplazamientos.length,
            page,
            limit,
            stats
        });
    } catch (err) {
        console.error('getAllDesplazamientos error:', err);
        res.status(200).json({ data: [], total: 0, page: 1, limit: 10, stats: {} });
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

// PUT /:id/status — Accept (4) or Reject (1)
const updateDesplazamientoStatus = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        await desplazamientoService.updateDesplazamiento(req.params.id, req.body, req.user.id);
        res.status(200).json({ message: 'Estado actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /:id/cancel — Cancel (2)
const cancelDesplazamiento = async (req, res) => {
    try {
        const desplazamientoService = new DesplazamientoService(req.app.get('db'));
        await desplazamientoService.updateDesplazamiento(req.params.id, { id_estado: 2 }, req.user.id);
        res.status(200).json({ message: 'Desplazamiento cancelado' });
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

module.exports = { 
    getAllDesplazamientos, 
    getDesplazamientoById, 
    createDesplazamiento, 
    updateDesplazamiento,
    updateDesplazamientoStatus,
    cancelDesplazamiento, 
    deleteDesplazamiento 
};
