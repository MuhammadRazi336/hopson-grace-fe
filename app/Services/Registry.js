import axiosInstance from "./interceptor";

const Registry_Services = {
  getEvents: () => axiosInstance.get("eventTypes"),
  createRegistry: (payload, token) => axiosInstance.post("registries", payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
  updateRegistry: (payload, token) => axiosInstance.put(`registries/${payload.id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
  updateEvent: (payload, token) => axiosInstance.put(`events/${payload.id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
  addShippingAddress: (payload, token) => axiosInstance.post("users/shippingAddress", payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
  updateShippingAddress: (payload, token) => axiosInstance.put(`users/shippingAddress/${payload.id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
};

export default Registry_Services;
