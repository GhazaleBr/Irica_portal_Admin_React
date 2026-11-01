import api from './api'; // فرض بر این است که اینس‌تنس axios در این مسیر قرار دارد

export const contentService = {
  // --- مدیریت محتوا (Contents) ---
  
  // ایجاد یا مدیریت محتواها
  manageContents: async (payload) => {
    const response = await api.post('admin/contents', payload);
    return response.data;
  },

  // دریافت اطلاعات یا ویرایش محتوا با شناسه
  getOrUpdateContentById: async (id, payload) => {
    const response = await api.post(`admin/contents/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی محتوا
  deactivateContent: async (id, payload = {}) => {
    const response = await api.post(`admin/contents/${id}/deactivate`, payload);
    return response.data;
  },

  // --- مدیریت دسته‌بندی‌های محتوا (Categories) ---
  
  // ایجاد یا مدیریت دسته‌بندی‌ها
  manageCategories: async (payload) => {
    const response = await api.post('admin/contents/categories', payload);
    return response.data;
  },

  // دریافت یا ویرایش دسته‌بندی با شناسه
  getOrUpdateCategoryById: async (id, payload) => {
    const response = await api.post(`admin/contents/categories/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی دسته‌بندی
  deactivateCategory: async (id, payload = {}) => {
    const response = await api.post(`admin/contents/categories/${id}/deactivate`, payload);
    return response.data;
  },

  // --- مدیریت پیوست‌های محتوا (Attachments) ---
  
  // ثبت یا آپلود پیوست جدید
  manageAttachments: async (payload) => {
    const response = await api.post('admin/contents/attachments', payload);
    return response.data;
  },

  // دریافت یا ویرایش پیوست با شناسه
  getOrUpdateAttachmentById: async (id, payload) => {
    const response = await api.post(`admin/contents/attachments/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی پیوست
  deactivateAttachment: async (id, payload = {}) => {
    const response = await api.post(`admin/contents/attachments/${id}/deactivate`, payload);
    return response.data;
  },

  // --- مدیریت گالری‌های محتوا (Galleries) ---
  
  // ثبت یا مدیریت گالری
  manageGalleries: async (payload) => {
    const response = await api.post('admin/contents/galleries', payload);
    return response.data;
  },

  // دریافت یا ویرایش گالری با شناسه
  getOrUpdateGalleryById: async (id, payload) => {
    const response = await api.post(`admin/contents/galleries/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی گالری
  deactivateGallery: async (id, payload = {}) => {
    const response = await api.post(`admin/contents/galleries/${id}/deactivate`, payload);
    return response.data;
  },

  // --- مدیریت مطالب مرتبط (Related) ---
  
  // ثبت یا مدیریت مطالب مرتبط
  manageRelated: async (payload) => {
    const response = await api.post('admin/contents/related', payload);
    return response.data;
  },

  // دریافت یا ویرایش مطلب مرتبط با شناسه
  getOrUpdateRelatedById: async (id, payload) => {
    const response = await api.post(`admin/contents/related/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی مطلب مرتبط
  deactivateRelated: async (id, payload = {}) => {
    const response = await api.post(`admin/contents/related/${id}/deactivate`, payload);
    return response.data;
  },
};
