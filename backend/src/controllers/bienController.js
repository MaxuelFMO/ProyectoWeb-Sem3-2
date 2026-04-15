const BienService = require('../services/bienService');

const getAllBienes = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        const isAdmin = req.user.id_tipo_cargo === 1;
        const bienes = await bienService.getAllBienes(req.user.id, isAdmin);
        res.status(200).json(Array.isArray(bienes) ? bienes : []);
    } catch (err) {
        console.error('getAllBienes error:', err);
        res.status(200).json([]);
    }
};

const getBienById = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        const bien = await bienService.getBienById(req.params.id);
        if (!bien) return res.status(404).json({ message: 'Bien not found' });
        res.status(200).json(bien);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        const id = await bienService.createBien(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        await bienService.updateBien(req.params.id, req.body);
        res.status(200).json({ message: 'Bien updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        await bienService.deleteBien(req.params.id);
        res.status(200).json({ message: 'Bien deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllBienes, getBienById, createBien, updateBien, deleteBien };
