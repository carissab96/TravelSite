import Cookies from 'js-cookie';

export async function fetchWithCsrf(url, options = {}) {
    options.method = options.method || 'GET';
    options.headers = options.headers || {};
    options.credentials = 'include'; // Important for cookies

    // Add CSRF token for all requests
    const xsrfToken = Cookies.get('XSRF-TOKEN');
    if (xsrfToken) {
        options.headers['XSRF-TOKEN'] = xsrfToken;
    }

    // Add Content-Type for non-GET requests
    if (options.method.toUpperCase() !== 'GET') {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    }

    try {
        console.log('Fetching:', url, 'with options:', options);
        const response = await fetch(url, options);
        console.log('Response:', response);

        if (!response.ok) {
            const data = await response.json();
            console.error('Response error:', data);
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Call this to get the "XSRF-TOKEN" cookie, should only be used in development
export async function restoreCSRF() {
    try {
        const response = await fetchWithCsrf('/api/csrf/restore');
        if (!response.ok) {
            throw new Error('Failed to restore CSRF token');
        }
        return response;
    } catch (error) {
        console.error('Failed to restore CSRF token:', error);
        throw error;
    }
}
