import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const projectApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_PROJECT_API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

projectApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        if (!originalRequest || !error.response) {
            return Promise.reject(error);
        }

        const status = error.response.status;
        const url = originalRequest.url || '';

        /** ❌ НЕ обробляємо refresh запит */
        if (url.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        /** 🔁 ACCESS TOKEN EXPIRED */
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (!isRefreshing) {
                    isRefreshing = true;

                    refreshPromise = projectApi
                        .post('/api/auth/refresh')
                        .then(() => {
                            // нічого не робимо, cookie оновились
                        })
                        .catch((err) => {
                            throw err;
                        })
                        .finally(() => {
                            isRefreshing = false;
                            refreshPromise = null; // 🔥 обов'язково
                        });
                }

                // ⏳ чекаємо поки refresh завершиться (усі запити сюди стануть в чергу)
                await refreshPromise;

                // 🔁 повторюємо оригінальний запит
                return projectApi.request(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        /** 🚫 REFRESH TOKEN INVALID */
        if (status === 403) {
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);