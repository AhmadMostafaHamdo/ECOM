import axios from 'axios';

// Replace with your backend URL
export const ROOT_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5007').replace(/\/$/, '');
const baseURL = `${ROOT_URL}/api`;



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
export const getCookie = (name) => {
    if (typeof document === "undefined") return null;

    // `document.cookie` can contain multiple cookies with the same name (different Path/Domain).
    // Do not assume uniqueness; return the last matching occurrence.
    const cookies = (document.cookie || "").split(";");
    let result = null;

    for (const raw of cookies) {
        const [rawName, ...rawValueParts] = raw.trim().split("=");
        if (!rawName || rawName !== name) continue;
        const rawValue = rawValueParts.join("=");
        try {
            result = decodeURIComponent(rawValue);
        } catch {
            result = rawValue;
        }
    }

    return result;
};

// Request interceptor to add CSRF token and Auth token manually
axiosInstance.interceptors.request.use((config) => {
    config.headers = config.headers || {};

    // Add CSRF Token
    const csrfToken = getCookie('csrfToken');
    if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
    }

    // Add Auth Token from localStorage as fallback for cookies
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
