// src/utils/authInterceptor.ts
export const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/login';
    }
    throw error;
};