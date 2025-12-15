import axios from 'axios';

export const projectApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PROJECT_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let wasRefreshed = false

projectApi.interceptors.response.use((config) => {
  return config;
},async (error) => {
  const originalRequest = error.config;
  if (error.response.status == 401 && error.config && !error.config._isRetry && !wasRefreshed) {
    originalRequest._isRetry = true;
    try {
      wasRefreshed = true;
      const response = await projectApi.post(`api/auth/refresh`)

      // localStorage.setItem('token', response.data.accessToken);
      return projectApi.request(originalRequest);
    } catch (e) {
      console.log('НЕ АВТОРИЗОВАН')
    }
  }
  throw error;
})