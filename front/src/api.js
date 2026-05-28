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

// Flag to prevent duplicate 401 redirect/toast when multiple requests fail at once
let isRedirectingTo401 = false;

// Request interceptor: attach CSRF token and Bearer token on every request
axiosInstance.interceptors.request.use((config) => {
    config.headers = config.headers || {};

    // Add CSRF Token
    const csrfToken = getCookie('csrfToken');
    if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
    }

    // Read the latest token from localStorage on every request
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor: handle 401 for protected requests only (not login/register)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config?.url || '';

        // Identify auth endpoints that should NOT trigger "session expired" behavior
        const isAuthEndpoint = ['/login', '/register'].some(
            (ep) => requestUrl === ep || requestUrl.endsWith(ep)
        );

        if (
            error.response &&
            error.response.status === 401 &&
            !isAuthEndpoint &&
            !isRedirectingTo401
        ) {
            // A protected request returned 401 → session is invalid
            isRedirectingTo401 = true;

            localStorage.removeItem('accessToken');
            localStorage.removeItem('authUser');

            // Only show toast and redirect if we're not already on /login
            if (window.location.pathname !== '/login') {
                import('react-toastify').then(({ toast }) => {
                    toast.error("Session expired or invalid. Please login again.", {
                        toastId: 'session-expired', // prevent duplicate toasts
                    });
                });
                setTimeout(() => {
                    window.location.href = '/login';
                    // Reset flag after redirect completes
                    setTimeout(() => { isRedirectingTo401 = false; }, 2000);
                }, 1200);
            } else {
                isRedirectingTo401 = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
