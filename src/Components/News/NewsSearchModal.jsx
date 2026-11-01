import React, { useState, useEffect } from 'react';
import getNews from '../../services/getNewsService';
import './NewsSearchModal.css';

export default function NewsSearchModal({ show, onHide, onSelectNews }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // تابع فراخوانی API
  const fetchNews = async (searchTerm = '') => {
    setLoading(true);
    try {
      const data = await getNews({
        Search: searchTerm,
        Page: 1,
        PageSize: 5, // نمایش ۵ خبر اول
      });

      // خروجی مستقیم از کلید items خوانده می‌شود
      setResults(data?.items || []);
    } catch (error) {
      console.error('خطا در بارگذاری اخبار:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // بارگذاری ۵ خبر اول به محض باز شدن مودال
  useEffect(() => {
    if (show) {
      setQuery('');
      setSearched(false);
      fetchNews('');
    }
  }, [show]);

  // هندل کردن فرم جستجو
  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    fetchNews(query.trim());
  };

  if (!show) return null;

  return (
    <div className="nsm-overlay" onClick={onHide}>
      <div className="nsm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nsm-header">
          <h5 className="nsm-title">جستجو در اخبار</h5>
          <button type="button" className="nsm-close" onClick={onHide} aria-label="بستن">
            ×
          </button>
        </div>

        <form className="nsm-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="nsm-input"
            placeholder="عنوان یا عبارت مورد نظر را وارد کنید..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="nsm-btn-search" disabled={loading}>
            {loading ? 'در حال جستجو...' : 'جستجو'}
          </button>
        </form>

        <div className="nsm-results">
          {loading && <p className="nsm-status">در حال دریافت اخبار...</p>}

          {!loading && results.length === 0 && (
            <p className="nsm-status nsm-muted">
              {searched ? 'نتیجه‌ای یافت نشد.' : 'خبری برای نمایش وجود ندارد.'}
            </p>
          )}

          {!loading &&
            results.map((news) => (
              <button
                key={news.id}
                type="button"
                className="nsm-item"
                onClick={() => {
                  onSelectNews(news);
                  onHide();
                }}
              >
                <span>{news.title}</span>
                {news.publishDate && (
                  <span className="nsm-badge">
                    تاریخ: {news.publishDate}
                  </span>
                )}
              </button>
            ))}
        </div>

        <div className="nsm-footer">
          <button type="button" className="nsm-btn-close" onClick={onHide}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
