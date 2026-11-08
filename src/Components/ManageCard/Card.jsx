import React from 'react';
import { PlusCircle, Edit3, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Card.css'; // یا مسیر فایل CSS کارت‌ها، مثلاً ../News/NewsManager.css

export default function Card({ 
  cards = [], 
  activeModal = null, 
  setActiveModal = () => {} 
}) {

  // انتخاب آیکون بر اساس نوع، متن یا اندیس بدون نیاز به ورودی آیکون از بیرون
  const resolveIcon = (card, index) => {
    if (card?.type === 'edit' || card?.title?.includes('ویرایش') || index === 1) {
      return <Edit3 size={22} />;
    }
    return <PlusCircle size={22} />;
  };

  const safeCards = Array.isArray(cards) ? cards : [];

  return (
    <div className="news-cards-page">
      {/* چیدمان افقی کارت‌ها */}
      <div className="news-cards-grid">
        {safeCards.map((card, index) => (
          <div key={card.id || card.to || index} className="news-main-card">
            <div className="news-card-top">
              <div>
                <h3 className="news-card-title">{card.title}</h3>
                <p className="news-card-desc">{card.description}</p>
              </div>
              <div className="news-icon-circle">
                {resolveIcon(card, index)}
              </div>
            </div>
            
            <div className="news-card-bottom">
              {card.to ? (
                <Link 
                  to={card.to} 
                  className="news-action-btn"
                  style={{ textDecoration: 'none' }}
                >
                  مشاهده جزئیات <ArrowRight size={16} />
                </Link>
              ) : (
                <button 
                  type="button"
                  className="news-action-btn"
                  onClick={card.onClick}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  مشاهده جزئیات <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* مودال در صورت فعال بودن */}
      {activeModal === 'edit' && (
        <div className="news-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="news-modal-header">
              <h4>مدیریت و ویرایش اخبار</h4>
              <button 
                type="button" 
                className="news-close-x" 
                onClick={() => setActiveModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="news-modal-body">
              <p>جدول جستجو و انتخاب اخبار ثبت‌شده قبلی جهت ویرایش اطلاعات در این بخش نمایش داده می‌شود.</p>
            </div>

            <div className="news-modal-footer">
              <button 
                type="button" 
                className="news-btn-close" 
                onClick={() => setActiveModal(null)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
