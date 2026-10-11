// src/services/newsService.js
import api from './api';

const getAuthHeaders = (extraHeaders = {}) => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken');

  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
  };
};

// ثبت خبر جدید
export const postNews = async (payload) => {
  const response = await api.post('/admin/news/', payload, getAuthHeaders());
  return response.data;
};

// آپلود تصاویر (بدون ست کردن دستی Content-Type برای جلوگیری از خطای Boundary)
export const uploadImages = async (formData) => {
  const response = await api.post('/admin/news/images/', formData, getAuthHeaders());
  return response.data;
};

// انتساب تصویر شاخص
export const assignFeaturedImage = async (payload) => {
  const response = await api.post('/admin/news/images/', payload, getAuthHeaders());
  return response.data;
};

// انتساب تصاویر به گالری خبر
export const assignGalleryImage = async (payload) => {
  const response = await api.post('/admin/news/galleries/', payload, getAuthHeaders());
  return response.data;
};
