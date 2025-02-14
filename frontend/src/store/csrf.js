import Cookies from 'js-cookie';

export async function fetchWithCsrf(url, options = {}) {
    options.method = options.method || 'GET';
    options.headers = options.headers || {};
    options.credentials = 'include'; // Important for cookies

    // Add CSRF token for all requests
    const xsrfToken = Cookies.get('XSRF-TOKEN');
    if (xsrfToken) {
        options.headers['X-CSRF-Token'] = xsrfToken;
    }

    // Add Content-Type for non-GET requests
    if (options.method.toUpperCase() !== 'GET') {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    }

    try {
        console.log('Fetching:', url, 'with options:', { 
            ...options, 
            headers: { ...options.headers, 'XSRF-TOKEN': xsrfToken }
        });
        
        const response = await fetch(url, options);
        console.log('Response:', response);

        // Don't throw on non-ok response, let the caller handle it
        return response;
    } catch (error) {
        console.error('Network error:', error);
        throw new Error('Network error. Please check your connection.');
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

export default fetchWithCsrf;