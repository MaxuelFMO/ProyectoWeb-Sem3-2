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
        // Business logic: check if email is valid, etc.
        return await this.userModel.create(userData);
    }

    async updateUser(id, userData) {
        return await this.userModel.update(id, userData);
    }

    async deleteUser(id) {
        return await this.userModel.delete(id);
    }
}

module.exports = UserService;
