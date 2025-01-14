export function createClient() {
  // Shared logic for making the API call
  async function baseClient(method, body, route, context) {
    const token = context?.session?.get('@User')?.accessToken;
    if ((method === 'POST' || method === 'PUT') && !body) {
      throw new Error(`Provide a body for the ${method} request`);
    }

    const endPoint = `https://dev-hopsongrace.codup.io/api/${route}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && {Authorization: `Bearer ${token}`}),
      },
      ...(body && {body: JSON.stringify(body)}), // Add body if applicable
    };

    const request = await fetch(endPoint, options);
    const response = await request.json();
    console.log(response, 'Response');
    return response;
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
