// Product Model - Layered Architecture
class ProductModel {
    constructor(db) {
        this.db = db;
    }

    async findAll() {
        const [rows] = await this.db.query('SELECT * FROM desplazamiento');
        return rows;
    }

    async findById(id) {
        const [rows] = await this.db.query('SELECT * FROM desplazamiento WHERE id = ?', [id]);
        return rows[0];
    }

    async create(desplazamiento) {
        const { name, description, price, stock } = desplazamiento;
        const [result] = await this.db.query(
            'INSERT INTO desplazamiento (name, description, price, stock) VALUES (?, ?, ?, ?)',
            [name, description, price, stock]
        );
        return result.insertId;
    }

    async update(id, desplazamiento) {
        const { name, description, price, stock } = desplazamiento;
        await this.db.query(
            'UPDATE desplazamientos SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [name, description, price, stock, id]
        );
        return true;
    }

    async delete(id) {
        await this.db.query('DELETE FROM desplazamiento WHERE id = ?', [id]);
        return true;
    }
}

module.exports = ProductModel;
