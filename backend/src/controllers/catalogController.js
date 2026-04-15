const getMotivos = async (req, res) => {
    try {
        const [rows] = await req.app.get('db').execute('SELECT id_motivo, nombre FROM MotivoDesplazamiento ORDER BY nombre');
        const mapped = rows.map((row) => ({ id_motivo: row.id_motivo, descripcion: row.nombre }));
        res.status(200).json({ data: mapped });
    } catch (err) {
        console.error('getMotivos error:', err);
        res.status(500).json({ error: err.message });
    }
};

const getEstados = async (req, res) => {
    try {
        const [rows] = await req.app.get('db').execute('SELECT id_estado, nombre FROM EstadoDesplazamiento ORDER BY nombre');
        const mapped = rows.map((row) => ({ id_estado: row.id_estado, descripcion: row.nombre }));
        res.status(200).json({ data: mapped });
    } catch (err) {
        console.error('getEstados error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getMotivos, getEstados };