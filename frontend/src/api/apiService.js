const BASE_URL = 'http://localhost:3000/api';

// Helper para agregar token JWT
const getAuthHeaders = (additional = {}) => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...additional
    };
};

export const UserAPI = {
    getAll: async () => {
        const response = await fetch(`${BASE_URL}/users`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    },
    create: async (user) => {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(user)
        });
        return await response.json();
    },
    update: async (id, user) => {
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(user)
        });
        return await response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await response.json();
    }
};

export const ProductAPI = {
    getAll: async () => {
        const response = await fetch(`${BASE_URL}/products`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    },
    create: async (product) => {
        const response = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(product)
        });
        return await response.json();
    },
    update: async (id, product) => {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(product)
        });
        return await response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await response.json();
    }
};

export const BienAPI = {
    getAll: async () => {
        const response = await fetch(`${BASE_URL}/bienes`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${BASE_URL}/bienes/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    },
    create: async (bien) => {
        const response = await fetch(`${BASE_URL}/bienes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bien)
        });
        return await response.json();
    },
    update: async (id, bien) => {
        const response = await fetch(`${BASE_URL}/bienes/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(bien)
        });
        return await response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${BASE_URL}/bienes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await response.json();
    }
};

export const HistorialAPI = {
    getAll: async () => {
        const response = await fetch(`${BASE_URL}/historial`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    },
    getByPersona: async (id_persona) => {
        const response = await fetch(`${BASE_URL}/historial/persona/${id_persona}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${BASE_URL}/historial/${id}`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    },
    create: async (historial) => {
        const response = await fetch(`${BASE_URL}/historial`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(historial)
        });
        return await response.json();
    },
    delete: async (id) => {
        const response = await fetch(`${BASE_URL}/historial/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await response.json();
    }
};
