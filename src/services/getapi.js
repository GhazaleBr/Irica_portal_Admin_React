import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL3,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  
  // بررسی وجود توکن و اضافه کردن آن به هدر با استاندارد Bearer
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // بررسی وضعیت 401 (عدم احراز هویت)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // هدایت به لاگین در صورتی که کاربر قبلاً در آن صفحه نباشد
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
