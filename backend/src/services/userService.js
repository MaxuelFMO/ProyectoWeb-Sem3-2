const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

class UserService {
    constructor(db) {
        this.userModel = new UserModel(db);
    }

    async getAllUsers() {
        return await this.userModel.findAll();
    }

    async getUserById(id) {
        return await this.userModel.findById(id);
    }

    async createUser(userData) {
        const { nombres, correo, password } = userData;

        if (!nombres || !correo || !password) {
            throw new Error('Nombres, correo y contraseña son requeridos');
        }

        const password_hash = await bcrypt.hash(password, 10);
        return await this.userModel.create({ ...userData, password_hash });
    }

    async updateUser(id, userData) {
        if (userData.currentPassword) {
            const existingUser = await this.userModel.findByIdWithHash(id);
            if (!existingUser) {
                throw new Error('Usuario no encontrado');
            }

            const isValid = await bcrypt.compare(userData.currentPassword, existingUser.password_hash);
            if (!isValid) {
                throw new Error('Contraseña actual incorrecta');
            }

            delete userData.currentPassword;
        }

        if (userData.password) {
            userData.password_hash = await bcrypt.hash(userData.password, 10);
            delete userData.password;
        }

        return await this.userModel.update(id, userData);
    }

    async deleteUser(id) {
        return await this.userModel.delete(id);
    }
}

module.exports = UserService;
