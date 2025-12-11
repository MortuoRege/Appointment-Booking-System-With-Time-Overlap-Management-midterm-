const BASE_URL = '/api'; // base URL for backend

async function apiRequest(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'API request failed');
    }
    return data;
}

export const api = {
    post: (endpoint, body) =>
        apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    get: (endpoint) =>
        apiRequest(endpoint, { method: 'GET' }),
    patch: (endpoint, body) =>
        apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
};
