const BienService = require('../services/bienService');
const XLSX = require('xlsx');

const getAllBienes = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        const isAdmin = req.user.id_tipo_cargo === 1;
        const bienes = await bienService.getAllBienes(req.user.id, isAdmin);
        res.status(200).json(bienes);
    } catch (err) {
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
        if (err.message.includes('ya está registrado')) {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

const updateBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        await bienService.updateBien(req.params.id, req.body, req.user.id);
        res.status(200).json({ message: 'Bien updated' });
    } catch (err) {
        if (err.message.includes('ya está registrado')) {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

const getTiposBien = async (req, res) => {
    try {
        const bienService = new BienService(req.app.get('db'));
        const tipos = await bienService.getTiposBien();
        res.status(200).json(tipos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const importBienes = async (req, res) => {
    try {
        let list = [];
        
        if (req.file) {
            // Es una carga de archivo Excel/CSV
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            list = XLSX.utils.sheet_to_json(sheet);
            
            // Mapeo básico si los nombres de columna en Excel son diferentes
            list = list.map(item => ({
                codigo: item.codigo || item.Codigo || item.ID || item.id,
                nombre: item.nombre || item.Nombre || item.Bien || item.Item,
                descripcion: item.descripcion || item.Descripcion || item.Detalle,
                valor: item.valor || item.Valor || item.Precio || 0,
                id_tipo_bien: item.id_tipo_bien || item.Tipo || item.Categoria || 1
            }));
        } else {
            // Es un envío directo de JSON
            list = req.body.bienes || [];
        }

        const bienService = new BienService(req.app.get('db'));
        const result = await bienService.importBienes(list, req.user.id);
        
        let message = `Sincronización finalizada.`;
        if (result.imported > 0) {
            message += ` ${result.imported} bienes nuevos añadidos.`;
        }
        
        if (result.skipped > 0) {
            message += ` Se detectaron ${result.skipped} registros duplicados que fueron omitidos para evitar conflictos.`;
        }
        
        // Retornamos el resultado con el detalle de duplicados
        res.status(200).json({ 
            message, 
            success: true,
            imported: result.imported, 
            skipped: result.skipped,
            duplicates: result.duplicates // Lista de códigos duplicados
        });
    } catch (err) {
        console.error('Import error:', err);
        res.status(500).json({ 
            error: 'Error procesando el archivo de importación',
            message: err.message 
        });
    }
};

const downloadTemplate = (req, res) => {
    const data = [
        ['codigo', 'nombre', 'descripcion', 'valor', 'id_tipo_bien'],
        ['B001', 'Laptop Dell', 'Core i7, 16GB RAM', 1200, 1],
        ['B002', 'Monitor LG', '27 pulgadas 4K', 400, 1]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla_bienes.xlsx');
    res.status(200).send(buffer);
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

module.exports = { 
    getAllBienes, 
    getBienById, 
    createBien, 
    updateBien, 
    getTiposBien,
    importBienes, 
    downloadTemplate,
    deleteBien 
};
