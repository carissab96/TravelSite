import Cookies from 'js-cookie';



export async function fetchWithCsrf(url, options = {}) {
    // Set options.method to 'GET' if there is no method
    options.method = options.method || 'GET';
    // Set options.headers to {} if there is no headers
    options.headers = options.headers || {};

    // If the options.method is not 'GET', then set the "Content-Type" header to
    // "application/json", and set the "XSRF-TOKEN" header to the value of the 
    // "XSRF-TOKEN" cookie
    if (options.method.toUpperCase() !== 'GET') {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
        options.headers['XSRF-TOKEN'] = Cookies.get('XSRF-TOKEN');
    }

    // Call the default window's fetch with the url and the options passed in
    const response = await window.fetch(url, options);

    // If the response status code is 400 or above, then throw the response as
    // an error since the API returned an unsuccessful response
    if (response.status >= 400) throw response;

    // If the response status code is under 400, then return the response to the
    // next promise chain
    return response;
}
// Call this to get the "XSRF-TOKEN" cookie, should only be used in development
export async function restoreCSRF() {
    return fetchWithCsrf('/api/csrf/restore');
}
