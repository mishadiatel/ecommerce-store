import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { routing } from '@/i18n/routing';

export const projectApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_PROJECT_API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Поточна мова сайту, що додається до всіх API запитів.
 * Оновлюється через setApiLocale() в Setup.tsx при зміні locale.
 */
let currentLocale: string = routing.defaultLocale;

export const setApiLocale = (locale: string) => {
    if (locale && typeof locale === 'string') {
        currentLocale = locale;
    }
};

export const getApiLocale = () => currentLocale;

/**
 * 🌐 Додає мову до кожного запиту:
 *  - як query param `lang`
 *  - як header `Accept-Language`
 * Якщо параметр/заголовок вже встановлений у виклику — не перевизначаємо.
 */
projectApi.interceptors.request.use((config) => {
    const params = (config.params as Record<string, unknown> | undefined) ?? {};
    if (!('lang' in params)) {
        config.params = { ...params, lang: currentLocale };
    }

    const headers = config.headers ?? {};
    const hasAcceptLanguage =
        // axios headers object: check both standard and lowercase keys
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (headers as any)['Accept-Language'] ?? (headers as any)['accept-language'];
    if (!hasAcceptLanguage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config.headers as any)['Accept-Language'] = currentLocale;
    }

    return config;
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
