import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    withCredentials: true, // Important for cookies if applicable
});

// Request interceptor for logging or adding headers
apiClient.interceptors.request.use(
    (config) => {
        // You can add token here if it's stored in localStorage/state (for client-side calls)
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



let isRedirecting = false;

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        // Handle 401 Unauthorized globally
        if (status === 401) {
            // Only handle one redirect at a time
            if (typeof window !== 'undefined' && !isRedirecting) {
                isRedirecting = true;

                toast.error('Session Expired', {
                    description: 'Please login again to continue.',
                    duration: 4000,
                });

                // Small delay to let user read the message
                setTimeout(() => {
                    isRedirecting = false;
                    window.location.href = '/login?expired=true';
                }, 2000);
            }
        }
        else if (status === 403) {
            toast.error('Permission Denied', {
                description: "You don't have access to this resource."
            });
        }
        else if (status >= 500) {
            toast.error('Server Error', {
                description: 'Something went wrong on our end. Please try again later.'
            });
        }

        return Promise.reject(error);
    }
);

export default apiClient;
