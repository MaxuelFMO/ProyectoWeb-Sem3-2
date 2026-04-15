const getMotivos = async (req, res) => {
    try {
        const [rows] = await req.app.get('db').execute('SELECT id_motivo, nombre FROM MotivoDesplazamiento ORDER BY nombre');
        const mapped = rows.map((row) => ({ id_motivo: row.id_motivo, descripcion: row.nombre }));
        res.status(200).json({ data: mapped });
    } catch (err) {
        console.error('getMotivos error:', err);
        res.status(200).json({ data: [] });
    }
};

const getEstados = async (req, res) => {
    try {
        const [rows] = await req.app.get('db').execute('SELECT id_estado, nombre FROM EstadoDesplazamiento ORDER BY nombre');
        const mapped = rows.map((row) => ({ id_estado: row.id_estado, descripcion: row.nombre }));
        res.status(200).json({ data: mapped });
    } catch (err) {
        console.error('getEstados error:', err);
        res.status(200).json({ data: [] });
    }
};

const getTiposDocumento = async (req, res) => {
    try {
        const [rows] = await req.app.get('db').execute('SELECT id_tipo_documento, nombre FROM TipoDocumento ORDER BY nombre');
        const mapped = rows.map((row) => ({ id_tipo_documento: row.id_tipo_documento, descripcion: row.nombre }));
        res.status(200).json({ data: mapped });
    } catch (err) {
        console.error('getTiposDocumento error:', err);
        res.status(200).json({ data: [] });
    }
};

const getTiposCargo = async (req, res) => {
    try {
        const [rows] = await req.app.get('db').execute('SELECT id_tipo_cargo, nombre FROM TipoCargo ORDER BY nombre');
        const mapped = rows.map((row) => ({ id_tipo_cargo: row.id_tipo_cargo, descripcion: row.nombre }));
        res.status(200).json({ data: mapped });
    } catch (err) {
        console.error('getTiposCargo error:', err);
        res.status(200).json({ data: [] });
    }
};

module.exports = { getMotivos, getEstados, getTiposDocumento, getTiposCargo };
