import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const projectApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PROJECT_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// let wasRefreshed = false
//
// projectApi.interceptors.response.use((config) => {
//   return config;
// },async (error) => {
//   const originalRequest = error.config;
//   if (error.response.status == 401 && error.config && !error.config._isRetry && !wasRefreshed) {
//     originalRequest._isRetry = true;
//     try {
//       wasRefreshed = true;
//       const response = await projectApi.post(`api/auth/refresh`)
//
//       // localStorage.setItem('token', response.data.accessToken);
//       return projectApi.request(originalRequest);
//     } catch (e) {
//       console.log('НЕ АВТОРИЗОВАН')
//     }
//   }
//   throw error;
// })

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

projectApi.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    /** 🔁 ACCESS TOKEN EXPIRED */
    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = projectApi
            .post('/api/auth/refresh')
            .then(() => {
              isRefreshing = false;
            })
            .catch(err => {
              isRefreshing = false;
              throw err;
            });
        }

        await refreshPromise;
        return projectApi.request(originalRequest);
      } catch {
        window.location.href = '/adminPanel/login';
        return Promise.reject(error);
      }
    }

    /** 🚫 REFRESH TOKEN INVALID */
    if (error.response.status === 403) {
      window.location.href = '/adminPanel/login';
    }

    return Promise.reject(error);
  }
);