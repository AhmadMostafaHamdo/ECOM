import axios from "axios";
import { loaderManager } from "./utils/loaderManager";

// Default configuration for Axios
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5007";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies, authorization headers, etc.
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Configure Axios interceptor to automatically add the CSRF token to headers
axiosInstance.interceptors.request.use((config) => {
    // Look for csrfToken in cookies
    const match = document.cookie.match(new RegExp('(^| )csrfToken=([^;]+)'));
    if (match && match[2]) {
        config.headers['X-CSRF-Token'] = match[2];
    }
    loaderManager.showLoader();
    return config;
}, (error) => {
    loaderManager.hideLoader();
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
    loaderManager.hideLoader();
    return response;
}, (error) => {
    loaderManager.hideLoader();
    return Promise.reject(error);
});

// Polyfill function replacing standard `fetch(apiUrl(url), options)` completely
export const fetchViaAxios = async (url, options = {}) => {
    // Try to clean up URL if it already contains the base (apiUrl wrapping)
    let cleanUrl = typeof url === 'string' ? url : url.toString();
    if (cleanUrl.startsWith(API_BASE_URL)) {
        cleanUrl = cleanUrl.replace(API_BASE_URL, '');
    }

    const method = (options.method || "GET").toLowerCase();

    // Parse headers 
    const headers = options.headers || {};

    // Handle body
    let data = options.body;

    try {
        const config = {
            method,
            url: cleanUrl,
            headers,
            data,
        };

        // Make request via axios
        const response = await axiosInstance(config);

        // Polyfill the standard Fetch API response object mapping from Axios
        return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers),
            json: async () => response.data,
            text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        };
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // We still need to return a valid Fetch-like response block for handling on the client side
            return {
                ok: false,
                status: error.response.status,
                statusText: error.response.statusText,
                headers: new Headers(error.response.headers),
                json: async () => error.response.data,
                text: async () => typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data),
            };
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('API Network Error', error.message);
            // throw error; // let the caller catch the error as typical fetch behaviour
            throw new Error(`[Axios Network Error]: ${error.message}`);
        }
    }
};

// Return full API URL to preserve backward compatibility across all modules natively
export const apiUrl = (path = "") => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export default axiosInstance;
