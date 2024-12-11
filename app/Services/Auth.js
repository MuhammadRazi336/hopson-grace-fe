import axiosInstance from './interceptor';

const Auth_Services = {
  Login: (payload) => axiosInstance.post('auth/login', payload),
  signUp: (payload) => axiosInstance.post('auth/signup', payload),
};

export default Auth_Services;
