// src/services/newsService.js
import api from './api';
import getapi from './getapi'

// دریافت امن توکن از sessionStorage با پشتیبانی از کلیدهای مرسوم
const getAuthHeaders = (extraHeaders = {}) => {
  const token =
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('jwt');

  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
  };
};

// ۱. ثبت خبر جدید (ارسال JSON)
export const postNews = async (payload) => {
  const response = await api.post('/admin/news/', payload, getAuthHeaders());
  return response.data;
};

// ۲. آپلود تک یا چند فایل تصویر (FormData)
export const uploadImages = async (formData) => {
  // عدم درج دستی Content-Type تا مرورگر خودش boundary دقیق را ست کند
  const response = await api.post('/admin/news/images/', formData, getAuthHeaders());
  return response.data;
};

// ۳. انتساب تصویر شاخص
export const assignFeaturedImage = async (payload) => {
  const response = await api.post('/admin/news/images/', payload, getAuthHeaders());
  return response.data;
};

// ۴. انتساب تصاویر به گالری خبر
export const assignGalleryImage = async (payload) => {
  const response = await api.post('/admin/news/galleries/', payload, getAuthHeaders());
  return response.data;
};

// ۵. جستجو یا واکشی لیست اخبار جهت پیوند اخبار مرتبط
export const getNewsList = async (params = {}) => {
  const response = await getapi.get('/news/', {
    ...getAuthHeaders(),
    params,
  });
  return response.data;
};

export const uploadMediaImage = async (fileObj, titleText, modelName = "news") => {
  const formData = new FormData();
  
  // افزودن فایل و فیلدهای الزامی بر اساس Swagger
  formData.append("file", fileObj);
  formData.append("title", titleText || "News Image");
  formData.append("description", "Uploaded from news panel");
  formData.append("imageTypeId", 2); // 2 = general image بر اساس راهنمای Swagger
  
  // در صورت نیاز به deactivateAt می‌توان آن را هم اضافه کرد (اختیاری است)
  // formData.append("deactivateAt", new Date(Date.now() + 365*24*60*60*1000).toISOString());

  // توجه: Content-Type را دستی ست نمی‌کنیم تا مرورگر خودش boundary را اعمال کند
  const response = await api.post(`/admin/media/upload/${modelName}`, formData, getAuthHeaders());
  return response.data;
};

export const assignNewsImage = async ({
  newsId,
  imageId,
  sortOrder,
  typeId,
  languageId,
}) => {
  const response = await api.post(
    "/admin/news/images/",
    { newsId, imageId, sortOrder, typeId, languageId },
    getAuthHeaders()
  );

  return response.data;
};

export const assignImageToGallery = async (payload) => {
  // payload: { galleryId, imageId, sortOrder, languageId }
  const response = await api.post('/admin/galleries/images', payload, getAuthHeaders());
  return response.data;
};

// انتساب خود گالری به خبر
export const assignGalleryToNews = async (payload) => {
  // معمولاً ساختاری مانند: { newsId, galleryId }
  const response = await api.post('/admin/news/galleries', payload, getAuthHeaders());
  return response.data;
};