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

// ─── Global auth flags ──────────────────────────────────────────────
// Prevents duplicate "session expired" toasts/redirects when multiple
// requests fail with 401 simultaneously.
let isHandlingUnauthorized = false;

// Set to true briefly during login/register so the 401 interceptor
// does not interfere with in-flight auth requests.
let isAuthenticating = false;

// Called by login/register to suppress 401 handling during auth flow
export const setAuthenticating = (value) => { isAuthenticating = value; };

// Called after the 401 redirect completes to reset the flag
export const resetUnauthorizedFlag = () => { isHandlingUnauthorized = false; };

// ─── Request interceptor ────────────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
    config.headers = config.headers || {};

    // CSRF token from cookie
    const csrfToken = getCookie('csrfToken');
    if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
    }

    // Read token fresh from localStorage on every request
    const token = localStorage.getItem('accessToken');

    // Only attach if it's a real JWT string
    if (token && token !== 'undefined' && token !== 'null' && typeof token === 'string') {
        config.headers['Authorization'] = `Bearer ${token}`;
    } else {
        // Remove Authorization header if no valid token
        delete config.headers['Authorization'];
    }

    // Dev-only: log what token is being sent
    if (import.meta.env.DEV) {
        console.log('[Axios Request]', config.method?.toUpperCase(), config.url, '| TOKEN:', token ? `${token.substring(0, 20)}...` : 'NONE');
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// ─── Response interceptor ───────────────────────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';

        // Dev-only: log 401s to help debug
        if (import.meta.env.DEV && status === 401) {
            console.warn('[Axios 401]', requestUrl, '| isAuthenticating:', isAuthenticating, '| isHandlingUnauthorized:', isHandlingUnauthorized);
        }

        // Skip 401 handling entirely if we're in the middle of login/register
        if (isAuthenticating) {
            return Promise.reject(error);
        }

        // Skip 401 handling for auth endpoints (login, register)
        const isAuthEndpoint = ['/login', '/register'].some(
            (ep) => requestUrl === ep || requestUrl.endsWith(ep)
        );

        if (
            status === 401 &&
            !isAuthEndpoint &&
            !isHandlingUnauthorized
        ) {
            isHandlingUnauthorized = true;

            localStorage.removeItem('accessToken');
            localStorage.removeItem('authUser');

            // Only show toast + redirect if not already on /login
            if (window.location.pathname !== '/login') {
                import('react-toastify').then(({ toast }) => {
                    toast.error("Session expired or invalid. Please login again.", {
                        toastId: 'session-expired', // prevent duplicate toasts
                    });
                });
                setTimeout(() => {
                    window.location.href = '/login';
                    setTimeout(() => { isHandlingUnauthorized = false; }, 3000);
                }, 1200);
            } else {
                isHandlingUnauthorized = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
