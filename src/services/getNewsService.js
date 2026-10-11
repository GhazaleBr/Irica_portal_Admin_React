// src/services/newsService.js
import api from './api';

const NEWS_ENDPOINT = '/news';

const removeEmptyParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

export const getNewsList = async ({
  search = '',
  categoryId,
  featured,
  page = 1,
  pageSize = 6,
} = {}) => {
  const params = removeEmptyParams({
    Search: search.trim(),
    CategoryId: categoryId,
    Featured: featured,
    Page: page,
    PageSize: pageSize,
  });

  const response = await api.get(NEWS_ENDPOINT, { params });

  return response.data;
};

export const getFeaturedNews = async () => {
  const response = await getNewsList({
    featured: true,
    page: 1,
    pageSize: 1,
  });

  return response.items?.[0] || null;
};


export const getNewsById = async (id) => {
  const response = await api.get(`${NEWS_ENDPOINT}/${id}`);
  return response.data;
};

// src/services/newsService.js

export const extractCategoriesFromNews = async () => {
  try {
    // دریافت صفحه اول با تعداد بالا (مثلاً ۱۰۰ خبر) برای استخراج کامل دسته‌ها
    const response = await getNewsList({ page: 1, pageSize: 100 });
    const items = response?.items || [];

    const categoryMap = new Map();

    items.forEach((newsItem) => {
      // بررسی وجود آرایه categories در هر خبر
      if (Array.isArray(newsItem.categories)) {
        newsItem.categories.forEach((cat) => {
          if (cat && cat.id !== undefined) {
            if (categoryMap.has(cat.id)) {
              // افزایش تعداد خبرهای این دسته‌بندی
              const existing = categoryMap.get(cat.id);
              existing.count += 1;
            } else {
              categoryMap.set(cat.id, {
                id: cat.id,
                title: cat.title,
                code: cat.code,
                count: 1,
              });
            }
          }
        });
      }
    });

    return Array.from(categoryMap.values());
  } catch (error) {
    console.error('خطا در استخراج دسته‌بندی‌ها:', error);
    return [];
  }
};

