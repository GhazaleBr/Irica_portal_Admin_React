import api from './api';

const USER_ENDPOINT = '/auth/me/';

/**
 * دریافت اطلاعات کاربر لاگین‌شده جاری
 * توکن به صورت خودکار توسط api.interceptors اضافه می‌شود.
 */
export const getUserInfo = async () => {
  const response = await api.get(USER_ENDPOINT);
  return response.data;
};

export default getUserInfo;
