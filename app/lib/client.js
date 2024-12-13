import ToastUtils from "~/utils/ToastUtil.js"; // Adjust path as necessary

export function createClient() {
  // Shared logic for making the API call
  async function baseClient(method, body, route, context, toastMessages = null) {
    const token = context?.session?.get("user_token")?.accessToken;
    if ((method === "POST" || method === "PUT") && !body) {
      return Promise.reject(new Error(`Provide a body for the ${method} request`));
    }

    const endPoint = `https://dev-hopsongrace.codup.io/api/${route}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }), // Add body if applicable
    };

    const apiCall = async () => {
      try {
        const request = await fetch(endPoint, options);
        const response = await request.json();
        return response;
      } catch (err) {
        return err
      }
    };

    // Use ToastUtils.promise for toast-based feedback
    if (toastMessages) {
      return ToastUtils.promise(apiCall(), {
        pending: toastMessages.pending || "Processing request...",
        success: toastMessages.success || "Request successful!",
        error: toastMessages.error || ((err) => err.message || "An error occurred."),
      });
    } else {
      return apiCall();
    }
  }

  // Separate functions for each HTTP method
  async function ClientPost(body, route, context, toastMessages) {
    return baseClient("POST", body, route, context, toastMessages);
  }

  async function ClientPut(body, route, context, toastMessages) {
    return baseClient("PUT", body, route, context, toastMessages);
  }

  async function ClientGet(route, context, toastMessages) {
    return baseClient("GET", null, route, context, toastMessages);
  }

  async function ClientDelete(route, context, toastMessages) {
    return baseClient("DELETE", null, route, context, toastMessages);
  }

  return { ClientPost, ClientPut, ClientGet, ClientDelete };
}
