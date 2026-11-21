// tenderService.js
import api from './api'; // مسیر فایل api تنظیم شود

const tenderService = {
  // ۱. مناقصه‌ها (Tenders)
  createTender: async (tenderData) => {
    const response = await api.post('/admin/tenders', tenderData);
    return response.data;
  },

  updateTender: async (id, tenderData) => {
    const response = await api.post(`/admin/tenders/${id}`, tenderData);
    return response.data;
  },

  deactivateTender: async (id) => {
    const response = await api.post(`/admin/tenders/${id}/deactivate`);
    return response.data;
  },

  // ۲. دسته‌بندی‌های مناقصه (Tender Categories)
  createTenderCategory: async (categoryData) => {
    const response = await api.post(
      '/admin/tenders/categories',
      categoryData
    );
    return response.data;
  },

  updateTenderCategory: async (id, categoryData) => {
    const response = await api.post(
      `/admin/tenders/categories/${id}`,
      categoryData
    );
    return response.data;
  },

  deactivateTenderCategory: async (id) => {
    const response = await api.post(
      `/admin/tenders/categories/${id}/deactivate`
    );
    return response.data;
  },

  // ۳. پیوست‌های مناقصه (Tender Attachments)
  createTenderAttachment: async (attachmentData) => {
    const response = await api.post(
      '/admin/tenders/attachments',
      attachmentData
    );
    return response.data;
  },

  updateTenderAttachment: async (id, attachmentData) => {
    const response = await api.post(
      `/admin/tenders/attachments/${id}`,
      attachmentData
    );
    return response.data;
  },

  deactivateTenderAttachment: async (id) => {
    const response = await api.post(
      `/admin/tenders/attachments/${id}/deactivate`
    );
    return response.data;
  },

  // ۴. اصلاحیه‌های مناقصه (Tender Modifications)
  createTenderModification: async (modificationData) => {
    const response = await api.post(
      '/admin/tenders/modifications',
      modificationData
    );
    return response.data;
  },

  updateTenderModification: async (id, modificationData) => {
    const response = await api.post(
      `/admin/tenders/modifications/${id}`,
      modificationData
    );
    return response.data;
  },

  deactivateTenderModification: async (id) => {
    const response = await api.post(
      `/admin/tenders/modifications/${id}/deactivate`
    );
    return response.data;
  },

  // ۵. پیوست‌های اصلاحیه (Modification Attachments)
  createModificationAttachment: async (attachmentData) => {
    const response = await api.post(
      '/admin/tenders/modification-attachments',
      attachmentData
    );
    return response.data;
  },

  updateModificationAttachment: async (id, attachmentData) => {
    const response = await api.post(
      `/admin/tenders/modification-attachments/${id}`,
      attachmentData
    );
    return response.data;
  },

  deactivateModificationAttachment: async (id) => {
    const response = await api.post(
      `/admin/tenders/modification-attachments/${id}/deactivate`
    );
    return response.data;
  },

  // ۶. انواع مناقصه (Tender Types)
  createTenderType: async (typeData) => {
    const response = await api.post(
      '/admin/tenders/types',
      typeData
    );
    return response.data;
  },

  updateTenderType: async (id, typeData) => {
    const response = await api.post(
      `/admin/tenders/types/${id}`,
      typeData
    );
    return response.data;
  },

  deactivateTenderType: async (id) => {
    const response = await api.post(
      `/admin/tenders/types/${id}/deactivate`
    );
    return response.data;
  },

  // ۷. وضعیت‌های مناقصه (Tender Statuses)
  createTenderStatus: async (statusData) => {
    const response = await api.post(
      '/admin/tenders/statuses',
      statusData
    );
    return response.data;
  },

  updateTenderStatus: async (id, statusData) => {
    const response = await api.post(
      `/admin/tenders/statuses/${id}`,
      statusData
    );
    return response.data;
  },

  deactivateTenderStatus: async (id) => {
    const response = await api.post(
      `/admin/tenders/statuses/${id}/deactivate`
    );
    return response.data;
  },

  // ۸. انواع پرداخت قیمت (Pay Price Types)
  createPayPriceType: async (payPriceTypeData) => {
    const response = await api.post(
      '/admin/tenders/pay-price-types',
      payPriceTypeData
    );
    return response.data;
  },

  updatePayPriceType: async (id, payPriceTypeData) => {
    const response = await api.post(
      `/admin/tenders/pay-price-types/${id}`,
      payPriceTypeData
    );
    return response.data;
  },

  deactivatePayPriceType: async (id) => {
    const response = await api.post(
      `/admin/tenders/pay-price-types/${id}/deactivate`
    );
    return response.data;
  },
};

export default tenderService;
