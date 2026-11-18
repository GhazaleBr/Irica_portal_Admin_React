import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import newsIcon from '../../assets/img/news.png';
import completeIcon from '../../assets/img/complete.png';
import draftIcon from '../../assets/img/draft.png';
import tenderIcon from '../../assets/img/tender.png';
import categoryIcon from '../../assets/img/category.png';
import subportalIcon from '../../assets/img/subportal.png';
import {
  FileCheck,
  SearchCheck,
  ArrowLeft,
  Pencil,
  Eye
} from 'lucide-react';
import './ServiceCards.css';

const servicesData = [
  { id: 11, category: 'dashboard', title: 'درج خبر', desc: 'مشاهده آخرین اخبار', icon:   <img src={newsIcon} alt="مشاهده جزئیات" style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
  />, link: '/addnews' },
  { id: 12, category: 'dashboard', title: 'درج بخشنامه', desc: 'ثبت خبر جدید در سامانه', icon: <SearchCheck size={20} />, link: '/addlaws' },
  { id: 13, category: 'dashboard', title: 'درج قرارداد', desc: 'ثبت و تنظیم قراردادهای جدید', icon: <SearchCheck size={20} />, link: '/addcontract' },
  { id: 14, category: 'dashboard', title: 'درج مناقصه', desc: 'ثبت و تنظیم مناقصه جدید', icon: <img src={tenderIcon} alt="مشاهده جزئیات" style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
  />, link: '/addtender' },
  { id: 15, category: 'dashboard', title: 'درج فرم', desc: 'ثبت و تنظیم فرم', icon: <SearchCheck size={20} />, link: '/addform' },
  { id: 16, category: 'dashboard', title: 'ساخت زیر پورتال', desc: 'ثبت و تنظیم زیر پورتال', icon: <img src={subportalIcon} alt="مشاهده جزئیات" style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
  />, link: '/createsubportal' },
  { id: 17, category: 'dashboard', title: 'درج محتوا', desc: 'بارگذاری بخشنامه‌های جدید', icon: <SearchCheck size={20} />, link: '/addcontent' },
  { id: 18, category: 'dashboard', title: 'درج طبقه بندی', desc: 'درج طبقه بندی', icon: <img src={categoryIcon} alt="مشاهده جزئیات" style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
  />, link: '/createcategory' },
  { id: 19, category: 'dashboard', title: 'درج بنر', desc: 'درج بنر ویژه خبری', icon: <SearchCheck size={20} />, link: '/createbanner' },
  { id: 20, category: 'dashboard', title: 'درج چندرسانه‌ای', desc: 'آپلود فایل‌های صوتی و تصویری', icon: <SearchCheck size={20} />, link: '/uploadmedia' }
];

const ITEMS_PER_PAGE = 9;

export default function ServiceCards({ activeCategory = 'dashboard', onCardClick, onEditClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

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

  const handleCardClick = (card) => {
    if (onCardClick) onCardClick(card);
    navigate(card.link);
  };

  const handleEditClick = (e, card) => {
    e.stopPropagation();
    if (onEditClick) onEditClick(card);
  };

  return (
    <section className="services-section">
      <div className="services-header">
        <h2 className="services-title">دسترسی سریع به خدمات</h2>
      </div>

      <div className="cards-grid">
        {currentCards.map((card) => (
          // هر کارت به div تبدیل شده تا داخلش امکان دکمه‌ی تعاملی باشد
          <div
            key={card.id}
            className="service-card"
            onClick={() => handleCardClick(card)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-top">
              <div className="card-info">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-desc">{card.desc}</p>
              </div>
              <div className="card-icon-circle">{card.icon}</div>
            </div>

              <div className="card-actions">
              {/* آیکون مشاهده جزئیات */}
              <Link to={`/cards/${card.id}`}
              className="icon-link details-icon"
              aria-label="مشاهده جزئیات"
              title="مشاهده جزئیات"
              onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={completeIcon} 
                  alt="مشاهده جزئیات" 
                  style={{ width: '60px', height: '60px', objectFit: 'contain' }} 
                />
              </Link>

              {/* آیکون ویرایش */}
              <Link to={`/cards/${card.id}/edit`}
              className="icon-link edit-icon"
              aria-label="ویرایش"
              title="ویرایش"
              onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={draftIcon} 
                  alt="مشاهده جزئیات" 
                  style={{ width: '60px', height: '60px', objectFit: 'contain' }} 
                />
              </Link>
              </div>

          </div>
        ))}
      </div>

      {/* Pagination */}
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
