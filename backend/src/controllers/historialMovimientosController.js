const HistorialMovimientosService = require('../services/historialMovimientosService');

const getAllHistorial = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const historial = await historialService.getAllHistorial();
        
        const filtered = historial.slice(offset, offset + limit);
        res.status(200).json({
            data: Array.isArray(filtered) ? filtered : [],
            total: historial.length,
            page,
            limit
        });
    } catch (err) {
        console.error('getAllHistorial error:', err);
        res.status(200).json({ data: [], total: 0, page: 1, limit: 20 });
    }
};

const getHistorialByPersona = async (req, res) => {
    try {
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const historial = await historialService.getHistorialByPersona(req.params.id_persona);
        res.status(200).json(Array.isArray(historial) ? historial : []);
    } catch (err) {
        console.error('getHistorialByPersona error:', err);
        res.status(200).json([]);
    }
};

const getHistorialById = async (req, res) => {
    try {
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const registro = await historialService.getHistorialById(req.params.id);
        if (!registro) return res.status(404).json({ message: 'Historial not found' });
        res.status(200).json(registro);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createHistorial = async (req, res) => {
    try {
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const id = await historialService.createHistorial(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteHistorial = async (req, res) => {
    try {
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        await historialService.deleteHistorial(req.params.id);
        res.status(200).json({ message: 'Historial deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllHistorial, getHistorialByPersona, getHistorialById, createHistorial, deleteHistorial };
