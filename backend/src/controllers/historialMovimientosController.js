const HistorialMovimientosService = require('../services/historialMovimientosService');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const getAllHistorial = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const isAdmin = req.user.id_tipo_cargo === 1;
        let historial;
        
        if (isAdmin) {
            historial = await historialService.getAllHistorial();
        } else {
            historial = await historialService.getHistorialByPersona(req.user.id);
        }

        // Aplicar filtros adicionales si existen (search, id_persona)
        if (req.query.search) {
            const search = req.query.search.toLowerCase();
            historial = historial.filter(h => 
                h.accion.toLowerCase().includes(search) || 
                (h.descripcion && h.descripcion.toLowerCase().includes(search)) ||
                (`${h.nombres || ''} ${h.apellidos || ''}`).toLowerCase().includes(search)
            );
        }

        if (req.query.id_persona && isAdmin) {
            historial = historial.filter(h => h.id_persona == req.query.id_persona);
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
        res.status(200).json({ data: [], total: 0, page: 1, limit: 20 });
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

const getHistorialByPersona = async (req, res) => {
    try {
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const historial = await historialService.getHistorialByPersona(req.params.id_persona);
        res.status(200).json({ data: historial });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createHistorial = async (req, res) => {
    try {
        const historialService = new HistorialMovimientosService(req.app.get('db'));
        const id = await historialService.createHistorial({
            ...req.body,
            usuario_registro: req.user.correo
        });
        res.status(201).json({ id_historial: id });
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

        // Aplicar los mismos filtros que en la tabla
        if (req.query.search) {
            const search = req.query.search.toLowerCase();
            historial = historial.filter(h => 
                h.accion.toLowerCase().includes(search) || 
                (h.descripcion && h.descripcion.toLowerCase().includes(search)) ||
                (`${h.nombres || ''} ${h.apellidos || ''}`).toLowerCase().includes(search)
            );
        }

        if (req.query.id_persona && isAdmin) {
            historial = historial.filter(h => h.id_persona == req.query.id_persona);
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Reporte de Historial de Movimientos', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 22);
        
        const tableData = historial.map(item => [
            new Date(item.fecha_hora).toLocaleString(),
            `${item.nombres || ''} ${item.apellidos || ''}`.trim() || 'Sistema',
            item.accion,
            item.descripcion || '-'
        ]);

        const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
        autoTable(doc, {
            startY: 25,
            head: [['Fecha', 'Persona', 'Acción', 'Descripción']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 120, 215] }
        });

        const pdfBuffer = doc.output('arraybuffer');
        
        // Log en historial
        await historialService.createHistorial({
            id_persona: req.user.id,
            accion: 'Generación de Reporte PDF',
            descripcion: `Se exportó un reporte de historial de movimientos${req.query.search ? ` con búsqueda: "${req.query.search}"` : ''}.`,
            usuario_registro: req.user.correo
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=historial.pdf');
        res.send(Buffer.from(pdfBuffer));
    } catch (err) {
        console.error('exportHistorialPDF error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    getAllHistorial, 
    getHistorialById, 
    getHistorialByPersona,
    createHistorial,
    deleteHistorial,
    exportHistorialPDF 
};
