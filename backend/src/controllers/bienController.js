const BienService = require('../services/bienService');
const HistorialMovimientosService = require('../services/historialMovimientosService');
const XLSX = require('xlsx');

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

const getTiposBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        const tipos = await bienService.getTiposBien();
        res.status(200).json(Array.isArray(tipos) ? tipos : []);
    } catch (err) {
        console.error('getTiposBien error:', err);
        res.status(500).json({ error: err.message });
    }
};

const importBienes = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Falta el archivo de importación' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

        const bienesToImport = rows
            .map((row) => ({
                nombre: row['nombre']?.toString().trim() || null,
                descripcion: row['descripcion']?.toString().trim() || null,
                valor: row['valor'] != null && row['valor'] !== '' ? Number(row['valor']) : null,
                id_tipo_bien: row['id_tipo_bien'] != null && row['id_tipo_bien'] !== '' ? Number(row['id_tipo_bien']) : null,
            }))
            .filter((row) => row.nombre);

        if (bienesToImport.length === 0) {
            return res.status(400).json({ error: 'No se encontraron bienes válidos en el archivo' });
        }

        const bienService = new BienService(req.app.get('db'));
        const importedCount = await bienService.importBienes(bienesToImport, req.user.id);

        // Registro en historial
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        await historialService.createHistorial({
            id_persona: req.user.id,
            accion: 'Importación de Bienes',
            descripcion: `Se importaron ${importedCount} bienes mediante archivo Excel.`,
            usuario_registro: req.user.correo
        });

        res.status(200).json({ importedCount });
    } catch (err) {
        console.error('importBienes error:', err);
        res.status(500).json({ error: err.message });
    }
};

const downloadTemplate = async (req, res) => {
    try {
        const workbook = XLSX.utils.book_new();
        const rows = [['nombre', 'descripcion', 'valor', 'id_tipo_bien']];
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="plantilla_bienes.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error('downloadTemplate error:', err);
        res.status(500).json({ error: err.message });
    }
};

const getBienById = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        const bien = await bienService.getBienById(req.params.id, req.user.id);
        if (!bien) return res.status(404).json({ message: 'Bien not found' });
        res.status(200).json(bien);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        const id = await bienService.createBien(req.body, req.user.id);
        res.status(201).json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        await bienService.updateBien(req.params.id, req.body, req.user.id);
        res.status(200).json({ message: 'Bien updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        await bienService.deleteBien(req.params.id, req.user.id);
        res.status(200).json({ message: 'Bien deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllBienes, getTiposBien, importBienes, downloadTemplate, getBienById, createBien, updateBien, deleteBien };
