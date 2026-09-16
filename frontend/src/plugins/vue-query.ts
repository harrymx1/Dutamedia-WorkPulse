import { QueryClient, type VueQueryPluginOptions } from '@tanstack/vue-query';
import { ApiError } from '../types/api.js';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 detik (SAD §16.3, §17.3)
      gcTime: 1000 * 60 * 5, // 5 menit
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        // Jangan retry jika error otorisasi atau resource 404
        if (error instanceof ApiError) {
          if (
            error.statusCode === 401 ||
            error.statusCode === 403 ||
            error.statusCode === 404
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export const vueQueryOptions: VueQueryPluginOptions = {
  queryClient,
};
