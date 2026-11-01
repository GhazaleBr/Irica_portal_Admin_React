import api from './api';

const getAuthHeaders = (extraHeaders = {}) => {
  const token =
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken');

  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
  };
};

/**
 * ۱. آپلود فایل پیوست در مدیا سرور
 * @param {File} file 
 * @param {string} title 
 * @param {string} description 
 * @param {string} model 
 */
export const uploadDirectiveMedia = async (file, title, description = '', model = 'directive') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', (title || file.name).substring(0, 200));

  if (description) {
    formData.append('description', description.substring(0, 500));
  }

  // مقداردهی deactivateAt با تاریخ و زمان جاری
  formData.append('deactivateAt', new Date().toISOString());

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext);
  if (isImage) {
    formData.append('imageTypeId', 2);
  }

  const response = await api.post(
    `/admin/media/upload/${model}`,
    formData,
    getAuthHeaders({ 'Content-Type': 'multipart/form-data' })
  );

  return response.data;
};

/**
 * ۲. ایجاد بخشنامه / قانون
 * @param {Object} payload 
 */
export const postDirective = async (payload) => {
  const response = await api.post('/admin/laws', payload, getAuthHeaders());
  return response.data;
};

/**
 * ۳. انتساب فایل آپلود شده به بخشنامه / قانون
 * فرمت ارسالی دقیقاً:
 * {
 *   "lawId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   "fileId": 0,
 *   "sortOrder": 0,
 *   "languageId": 0
 * }
 */
export const assignFileToDirective = async (payload) => {
  const response = await api.post('/admin/laws/attachments', payload, getAuthHeaders());
  return response.data;
};
