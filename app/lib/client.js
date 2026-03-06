export function createClient() {
  // Shared logic for making the API call
  async function baseClient(method, body, route, context) {
    const token = context?.session?.get('@User')?.accessToken;
    if ((method === 'POST' || method === 'PUT') && !body) {
      throw new Error(`Provide a body for the ${method} request`);
    }

    const apiBase =
      context?.env?.API_BASE_URL || process.env.API_BASE_URL;
    const endPoint = `${String(apiBase).replace(/\/$/, '')}/api/${route}`;
    const options = {
      method,
      headers: {
        ...(!(body instanceof FormData) &&
          method !== 'GET' &&
          method !== 'HEAD' && {
            'Content-Type': 'application/json',
          }),
        ...(token && {Authorization: `Bearer ${token}`}),
      },
      ...(method !== 'GET' &&
        method !== 'HEAD' && {
          body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    };
  
    try {
      const request = await fetch(endPoint, options);
      const contentType = request.headers.get('content-type');
    
      if (!request.ok) {
        // Handle session expiration (401 Unauthorized or 403 Forbidden)
        if (request.status === 401 || request.status === 403) {
          // Throw a specific error that can be caught by loaders
          const error = new Error('Session expired. Please login again.');
          error.status = request.status;
          error.isSessionExpired = true;
          throw error;
        }
        
        const errorData = contentType?.includes('application/json')
          ? await request.json()
          : await request.text();
    
        throw new Error(
          errorData?.message || errorData || `API request failed with status ${request.status}`
        );
      }
    
      const response = await request.json();
      return response;
    } catch (err) {
      // Re-throw session expiration errors
      if (err.isSessionExpired) {
        throw err;
      }
      throw err;
    }
  }

  // Separate functions for each HTTP method
  async function ClientPost(body, route, context) {
    return baseClient('POST', body, route, context);
  }

  async function ClientPut(body, route, context) {
    return baseClient('PUT', body, route, context);
  }

  async function ClientGet(route, context) {
    return baseClient('GET', null, route, context);
  }

  async function ClientDelete(route, context) {
    return baseClient('DELETE', null, route, context);
  }

  return {ClientPost, ClientPut, ClientGet, ClientDelete};
}
