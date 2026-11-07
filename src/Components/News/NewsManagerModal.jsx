import React, { useState } from 'react';
import { PlusCircle, Edit3, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './NewsManager.css';

export default function NewsSection() {
  const [activeModal, setActiveModal] = useState(null); // 'edit' | null

  return (
    <div className="news-cards-page">
      {/* چیدمان افقی کارت‌ها در بالای صفحه (وسط چین) */}
      <div className="news-cards-grid">
        
        {/* کارت ۱: درج خبر (انتقال به آدرس /addnews/create) */}
        <div className="news-main-card">
          <div className="news-card-top">
            <div>
              <h3 className="news-card-title">درج خبر</h3>
              <p className="news-card-desc">ثبت و ایجاد خبر جدید در سامانه</p>
            </div>
            <div className="news-icon-circle">
              <PlusCircle size={22} />
            </div>
          </div>
          
          <div className="news-card-bottom">
            <Link 
              to="/addnews/create" 
              className="news-action-btn"
              style={{ textDecoration: 'none' }}
            >
              مشاهده جزئیات <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* کارت ۲: ویرایش خبر */}
        <div className="news-main-card">
          <div className="news-card-top">
            <div>
              <h3 className="news-card-title">ویرایش خبر</h3>
              <p className="news-card-desc">ویرایش، به‌روزرسانی و مدیریت اخبار ثبت‌شده</p>
            </div>
            <div className="news-icon-circle">
              <Edit3 size={22} />
            </div>
          </div>
          
          <div className="news-card-bottom">
            <Link 
              to="/addnews/edit" 
              className="news-action-btn"
              style={{ textDecoration: 'none' }}
            >
              مشاهده جزئیات <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>

      {/* مودال مربوط به ویرایش خبر */}
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
