const HistorialMovimientosService = require('../services/historialMovimientosService');

const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const getAllHistorial = async (req, res) => {
    try {
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const isAdmin = req.user.id_tipo_cargo === 1; // 1 = Administrador
        let historial;

        if (isAdmin) {
            historial = await historialService.getAllHistorial();
        } else {
            historial = await historialService.getHistorialByPersona(req.user.id);
        }

        const filtered = historial.slice(offset, offset + limit);
        res.status(200).json({
            data: Array.isArray(filtered) ? filtered : [],
            total: historial.length,
            page,
            limit
        });
    } catch (err) {
        console.error('getAllHistorial error:', err);
        res.status(200).json([]);
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

const exportHistorialPDF = async (req, res) => {
    try {
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const isAdmin = req.user.id_tipo_cargo === 1;
        let historial;

        if (isAdmin) {
            historial = await historialService.getAllHistorial();
        } else {
            historial = await historialService.getHistorialByPersona(req.user.id);
        }

        const doc = new jsPDF();
        doc.text('Reporte de Historial de Movimientos', 14, 15);

        const tableData = historial.map(item => [
            new Date(item.fecha_hora).toLocaleString(),
            `${item.nombres} ${item.apellidos}`,
            item.accion,
            item.descripcion || '-'
        ]);

        const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
        autoTable(doc, {
            startY: 20,
            head: [['Fecha', 'Persona', 'Acción', 'Descripción']],
            body: tableData,
        });

        const pdfBuffer = doc.output('arraybuffer');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=historial.pdf');
        res.send(Buffer.from(pdfBuffer));
    } catch (err) {
        console.error('exportHistorialPDF error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllHistorial, getHistorialByPersona, getHistorialById, createHistorial, deleteHistorial, exportHistorialPDF };
