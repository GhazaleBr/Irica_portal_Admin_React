import api from './api'; // مسیر فایل api تنظیم شود

const categoryService = {
  // ۱. دسته‌بندی‌ها (Categories)
  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.post(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  deactivateCategory: async (id) => {
    const response = await api.post(`/admin/categories/${id}/deactivate`);
    return response.data;
  },

  // ۲. انواع دسته‌بندی (Category Types)
  createCategoryType: async (typeData) => {
    const response = await api.post('/admin/categories/types', typeData);
    return response.data;
  },

  updateCategoryType: async (id, typeData) => {
    const response = await api.post(`/admin/categories/types/${id}`, typeData);
    return response.data;
  },

  deactivateCategoryType: async (id) => {
    const response = await api.post(`/admin/categories/types/${id}/deactivate`);
    return response.data;
  },

  // ۳. تگ‌ها (Tags)
  createTag: async (tagData) => {
    const response = await api.post('/admin/categories/tags', tagData);
    return response.data;
  },

  updateTag: async (id, tagData) => {
    const response = await api.post(`/admin/categories/tags/${id}`, tagData);
    return response.data;
  },

  deactivateTag: async (id) => {
    const response = await api.post(`/admin/categories/tags/${id}/deactivate`);
    return response.data;
  },
};

export default categoryService;
