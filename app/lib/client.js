
export function createClient() {
  const client = async function (body, route, customRequest) {
    if (!body) {
      throw new Error("Provide a Query to admin Client")
    }
    const endPoint = `https://qa-hopsongrace.codup.io/api/${route}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specifies JSON payload
      },
      body:JSON.stringify(body)
    }
    const request = await fetch(endPoint, options);
    const response = await request.json();
    if (response?.error?.length) {
      throw new Error(response?.errors[0]?.message)
    }
    return response;
  }
  return { client }
}
