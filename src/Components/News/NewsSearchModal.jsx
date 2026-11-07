import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews } from '../../services/getNewsService';
import './NewsSearchModal.css';

export default function NewsSearchModal({ show = true, onHide, onSelectNews }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // بستن یا بازگشت به مسیر قبلی
  const handleClose = () => {
    if (onHide) {
      onHide();
    } else {
      navigate(-1); // بازگشت به صفحه قبل (داشبورد)
    }
  };

  // تابع فراخوانی API
  const fetchNews = async (searchTerm = '') => {
    setLoading(true);
    try {
      const data = await getNews({
        Search: searchTerm,
        Page: 1,
        PageSize: 5,
      });
      setResults(data?.items || []);
    } catch (error) {
      console.error('خطا در بارگذاری اخبار:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // بارگذاری داده‌ها در ابتدای لود
  useEffect(() => {
    if (show) {
      setQuery('');
      setSearched(false);
      fetchNews('');
    }
  }, [show]);

  // انتخاب یک خبر برای ویرایش
  const handleSelect = (news) => {
    if (onSelectNews) {
      onSelectNews(news);
    } else {
      // هدایت به صفحه ویرایش با شناسه خبر
      navigate(`/addnews/edit/${news.id}`, { state: { news } });
    }
  };

  if (!show) return null;

  return (
    <div className="nsm-overlay" onClick={handleClose}>
      <div className="nsm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nsm-header">
          <h5 className="nsm-title">جستجو و انتخاب خبر جهت ویرایش</h5>
          <button type="button" className="nsm-close" onClick={handleClose} aria-label="بستن">
            ×
          </button>
        </div>

        <form className="nsm-search-form" onSubmit={(e) => {
          e.preventDefault();
          setSearched(true);
          fetchNews(query.trim());
        }}>
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
                onClick={() => handleSelect(news)}
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
          <button type="button" className="nsm-btn-close" onClick={handleClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
