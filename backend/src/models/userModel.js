class UserModel {
    constructor(db) {
        this.db = db;
    }

    async findAll() {
        const [rows] = await this.db.query('SELECT id, name, email, created_at FROM users');
        return rows;
    }

    async findById(id) {
        const [rows] = await this.db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    async create(user) {
        const { name, email, password } = user;
        const [result] = await this.db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );
        return result.insertId;
    }

    async update(id, user) {
        const { name, email } = user;
        await this.db.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, id]
        );
        return true;
    }

    async delete(id) {
        await this.db.query('DELETE FROM users WHERE id = ?', [id]);
        return true;
    }
}

module.exports = UserModel;
