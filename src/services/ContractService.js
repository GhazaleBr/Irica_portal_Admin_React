import api from './api'; // فرض بر این است که فایل بالا با نام api.js ذخیره شده است

export const contractService = {
  // --- مدیریت قراردادها (Contracts) ---
  
  // ایجاد یا جستجوی قراردادها
  manageContracts: async (payload) => {
    const response = await api.post('admin/contracts', payload);
    return response.data;
  },

  // دریافت اطلاعات یا ویرایش قرارداد با شناسه
  getOrUpdateContractById: async (id, payload) => {
    const response = await api.post(`admin/contracts/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی قرارداد
  deactivateContract: async (id, payload = {}) => {
    const response = await api.post(`admin/contracts/${id}/deactivate`, payload);
    return response.data;
  },

  // --- مدیریت پیوست‌های قرارداد (Attachments) ---
  
  // ثبت یا آپلود پیوست جدید
  manageAttachments: async (payload) => {
    const response = await api.post('contracts/attachments', payload);
    return response.data;
  },

  // دریافت یا ویرایش پیوست با شناسه
  getOrUpdateAttachmentById: async (id, payload) => {
    const response = await api.post(`contracts/attachments/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی پیوست
  deactivateAttachment: async (id, payload = {}) => {
    const response = await api.post(`contracts/attachments/${id}/deactivate`, payload);
    return response.data;
  },

  // --- مدیریت وضعیت‌های قرارداد (Statuses) ---
  
  // تعریف یا مدیریت وضعیت‌ها
  manageStatuses: async (payload) => {
    const response = await api.post('contracts/statuses', payload);
    return response.data;
  },

  // دریافت یا ویرایش وضعیت با شناسه
  getOrUpdateStatusById: async (id, payload) => {
    const response = await api.post(`contracts/statuses/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی وضعیت
  deactivateStatus: async (id, payload = {}) => {
    const response = await api.post(`contracts/statuses/${id}/deactivate`, payload);
    return response.data;
  },

  // --- مدیریت انواع پیوست (Attachment Types) ---
  
  // تعریف یا مدیریت انواع پیوست
  manageAttachmentTypes: async (payload) => {
    const response = await api.post('contracts/attachment-types', payload);
    return response.data;
  },

  // دریافت یا ویرایش نوع پیوست با شناسه
  getOrUpdateAttachmentTypeById: async (id, payload) => {
    const response = await api.post(`contracts/attachment-types/${id}`, payload);
    return response.data;
  },

  // غیرفعال‌سازی نوع پیوست
  deactivateAttachmentType: async (id, payload = {}) => {
    const response = await api.post(`contracts/attachment-types/${id}/deactivate`, payload);
    return response.data;
  },
};
