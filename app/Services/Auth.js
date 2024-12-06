import axiosInstance from "./interceptor";

const Auth_Services = {
  Login: (payload) => axiosInstance.post("auth/login", payload)
};

export default Auth_Services;
