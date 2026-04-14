// Product Model - Layered Architecture
class ProductModel {
    constructor(db) {
        this.db = db;
    }

    async findAll() {
        const [rows] = await this.db.query('SELECT * FROM bien');
        return rows;
    }

    async findById(id) {
        const [rows] = await this.db.query('SELECT * FROM bien WHERE id = ?', [id]);
        return rows[0];
    }

    async create(product) {
        const { name, description, price, stock } = product;
        const [result] = await this.db.query(
            'INSERT INTO bien (name, description, price, stock) VALUES (?, ?, ?, ?)',
            [name, description, price, stock]
        );
        return result.insertId;
    }

    async update(id, product) {
        const { name, description, price, stock } = product;
        await this.db.query(
            'UPDATE bien SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [name, description, price, stock, id]
        );
        return true;
    }

    async delete(id) {
        await this.db.query('DELETE FROM bien WHERE id = ?', [id]);
        return true;
    }
}

module.exports = ProductModel;
