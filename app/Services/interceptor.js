import axios from 'axios';
import {buildApiUrl} from '~/utils/api-url';

const axiosInstance = axios.create({
  baseURL: buildApiUrl(''),
  timeout: 20000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config, token) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // If method is not GET, trigger success message
    console.log('response.config.method', response.config.method);

    return response.data;
  },
  (error) => {
    // Handle errors for non-GET methods
    return Promise.reject(error);
  },
);

export default axiosInstance;
