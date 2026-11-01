import api from './getapi';

/**
 * دریافت لیست اخبار
 * نکته: اگر در api.js یا env کلمه admin وجود دارد، مسیر را در اینجا اصلاح می‌کنیم.
 */
export const getNews = async (params = {}) => {
  try {
    // استفاده از مسیر مستقیم /api/news طبق تصویر Swagger
    const response = await api.get('/api/news', {
      params: {
        Search: params.Search || undefined,
        CategoryId: params.CategoryId || undefined,
        Featured: params.Featured,
        Page: params.Page || 1,
        PageSize: params.PageSize || 5,
      },
    });

    return response.data;
  } catch (error) {
    // چاپ خطا برای بررسی اینکه URL نهایی چیست
    console.error('Error fetching news from:', error.config?.url, error);
    throw error;
  }
};
