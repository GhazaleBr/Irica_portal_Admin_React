import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom'; // اضافه کردن لینک
import {
  FileCheck,
  SearchCheck,
  ArrowLeft
} from 'lucide-react';
import './ServiceCards.css';

// اضافه شدن فیلد link به داده‌ها
const servicesData = [
  {
    id: 11,
    category: 'services',
    title: 'درج خبر',
    desc: 'مشاهده آخرین اخبار',
    icon: <FileCheck size={20} />,
    link: '/addnews'
  },
  {
    id: 12,
    category: 'services',
    title: 'درج بخشنامه',
    desc: 'ثبت خبر جدید در سامانه',
    icon: <SearchCheck size={20} />,
    link: '/addlaws'
  },
  {
    id: 13,
    category: 'services',
    title: 'درج قرارداد',
    desc: 'ثبت و تنظیم قراردادهای جدید',
    icon: <SearchCheck size={20} />,
    link: '/addcontract'
  },
  {
    id: 14,
    category: 'services',
    title: 'درج محتوا',
    desc: 'بارگذاری بخشنامه‌های جدید',
    icon: <SearchCheck size={20} />,
    link: '/addcontent'
  },
  {
    id: 15,
    category: 'services',
    title: 'درج طبقه بندی',
    desc: 'درج طبقه بندی',
    icon: <SearchCheck size={20} />,
    link: '/createcategory'
  },
    {
    id: 16,
    category: 'services',
    title: 'درج بنر',
    desc: 'درج بنر ویژه خبری',
    icon: <SearchCheck size={20} />,
    link: '/createbanner'
  }
  
];

const ITEMS_PER_PAGE = 9;

export default function ServiceCards({ activeCategory = 'dashboard', onCardClick }) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCards = useMemo(() => {
    if (activeCategory === 'dashboard') {
      return servicesData.filter((item) => item.category === 'dashboard');
    }
    const filtered = servicesData.filter((item) => item.category === activeCategory);
    return filtered.length > 0 ? filtered : servicesData.filter((item) => item.category === 'dashboard');
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCards = filteredCards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section className="services-section">
      <div className="services-header">
        <h2 className="services-title">دسترسی سریع به خدمات</h2>
      </div>

      <div className="cards-grid">
        {currentCards.map((card) => (
          // استفاده از Link برای کل کارت
          <Link 
            key={card.id} 
            to={card.link} 
            className="service-card"
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={() => onCardClick && onCardClick(card)}
          >
            <div className="card-top">
              <div className="card-info">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-desc">{card.desc}</p>
              </div>
              <div className="card-icon-circle">{card.icon}</div>
            </div>

            <div className="card-bottom">
              {/* تبدیل دکمه به div برای جلوگیری از تداخل تگ‌های تعاملی */}
              <div className="details-btn">
                <span>مشاهده جزئیات</span>
                <ArrowLeft size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination (بدون تغییر) */}
      <div className="pagination-container">
        <button type="button" className="page-nav-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
          <span>بعدی</span>
          <ArrowLeft size={15} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button key={pageNum} type="button" className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`} onClick={() => setCurrentPage(pageNum)}>
            {pageNum}
          </button>
        ))}

        <button type="button" className="page-nav-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
          <ArrowLeft size={15} style={{ transform: 'rotate(180deg)' }} />
          <span>قبلی</span>
        </button>
      </div>
    </section>
  );
}
