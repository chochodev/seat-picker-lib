// utils/csrftoken.js
import axios from 'axios';
import { useTokenState } from '@/zustand/store';

// :::::::::::::::: axiosInstance config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_API_URL,
});

// :::::::::::::::: axiosInstance default header
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = useTokenState.getState().tokenValues.authToken;
    // console.log('auth token value:', authToken);
    // console.log('header token: ', token);
    if (authToken.refresh?.length > 0 && authToken.access?.length > 0) {
      config.headers.Authorization = `Bearer ${authToken.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
