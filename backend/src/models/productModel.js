// Product Model - Layered Architecture
class ProductModel {
    constructor(db) {
        this.db = db;
    }

    async findAll() {
        const [rows] = await this.db.query('SELECT id_bien as id, nombre as name, descripcion as description, valor as price, estado as stock FROM Bien');
        return rows;
    }

    async findById(id) {
        const [rows] = await this.db.query('SELECT id_bien as id, nombre as name, descripcion as description, valor as price, estado as stock FROM Bien WHERE id_bien = ?', [id]);
        return rows[0];
    }

    async create(product) {
        const { name, description, price } = product;
        const [result] = await this.db.query(
            'INSERT INTO Bien (nombre, descripcion, valor, estado) VALUES (?, ?, ?, TRUE)',
            [name, description, price]
        );
        return result.insertId;
    }

    async update(id, product) {
        const { name, description, price, stock } = product;
        await this.db.query(
            'UPDATE Bien SET nombre = ?, descripcion = ?, valor = ?, estado = ? WHERE id_bien = ?',
            [name, description, price, stock, id]
        );
        return true;
    }

    async delete(id) {
        await this.db.query('DELETE FROM Bien WHERE id_bien = ?', [id]);
        return true;
    }
}

module.exports = ProductModel;
