import axios from 'axios';

// Replace with your backend URL
const baseURL = 'http://localhost:5007';

/**
 * Normalizes and returns the full API URL for a given path.
 */
export const apiUrl = (path) => {
    if (!path) return baseURL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseURL}${cleanPath}`;
};

/**
 * Pre-configured Axios instance for application-wide use.
 */
export const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

// Helper to get cookie value by name
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Request interceptor to add CSRF token manually
axiosInstance.interceptors.request.use((config) => {
    const token = getCookie('csrfToken');
    if (token) {
        config.headers['x-csrf-token'] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * Polyfill for window.fetch that uses Axios internally.
 * This allows keeping existing fetch calls while benefiting from Axios.
 */
export const fetchViaAxios = async (url, options = {}) => {
    try {
        const config = {
            url: typeof url === 'object' && url.toString ? url.toString() : url,
            method: options.method || 'GET',
            headers: options.headers || {},
            data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
            ...options
        };

        // Remove fetch-specific options that aren't valid in Axios config
        delete config.body;
        delete config.credentials;

        const response = await axiosInstance(config);

        // Transform Axios response to match the native Fetch API response structure
        return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            statusText: response.statusText,
            headers: {
                get: (name) => response.headers[name.toLowerCase()] || null,
                forEach: (cb) => Object.entries(response.headers).forEach(([k, v]) => cb(v, k)),
            },
            json: async () => response.data,
            text: async () => (typeof response.data === 'string' ? response.data : JSON.stringify(response.data)),
            blob: async () => new Blob([JSON.stringify(response.data)]),
        };
    } catch (error) {
        if (error.response) {
            const { response } = error;
            return {
                ok: false,
                status: response.status,
                statusText: response.statusText,
                headers: {
                    get: (name) => response.headers[name.toLowerCase()] || null,
                },
                json: async () => response.data,
                text: async () => (typeof response.data === 'string' ? response.data : JSON.stringify(response.data)),
            };
        }

        // Handle network errors or other issues
        console.error('API Fetch Error:', error);
        throw error;
    }
};

export default axiosInstance;
