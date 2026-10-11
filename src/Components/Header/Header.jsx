import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Bell, Menu, User, ChevronDown } from 'lucide-react';
import './Header.css';
import CustomIcon from '../../assets/header icon/cust-text2.png';

export default function Header({
  theme = 'light',
  onToggleTheme,
  userName = 'کاربر سامانه',
  userProfilePath = '/userprofile', // مسیر پیش‌فرض پروفایل
  onMenuToggle,
  onNotificationClick
}) {
  return (
    <header className="header-container">
      {/* سمت راست: دکمه منو و برندینگ گمرک */}
      <div className="header-right">
        {onMenuToggle && (
          <button type="button" className="header-icon-btn" onClick={onMenuToggle} title="منو">
            <Menu size={20} />
          </button>
        )}

        <div className="header-logo-box">
          <img src={CustomIcon} alt="لوگوی گمرک" />
        </div>

        <div className="header-titles">
          <span className="header-main-title">گمرک جمهوری اسلامی ایران</span>
          <span className="header-sub-title">سامانه جامع امور گمرکی</span>
        </div>
      </div>

      {/* سمت چپ: دکمه دارک‌مود، نوتیفیکیشن، پروفایل */}
      <div className="header-left">
        {/* دکمه تغییر تم داخل هدر */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'تغییر به حالت شب' : 'تغییر به حالت روز'}
        >
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} color="#f59e0b" />}
        </button>

        {/* اعلان‌ها */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={onNotificationClick}
          title="اعلان‌ها"
        >
          <Bell size={19} />
        </button>

        {/* لینک اطلاعات کاربر / پروفایل */}
        <Link to={userProfilePath} className="header-user-btn" title="مشاهده پروفایل">
          <User size={18} />
          <span>{userName}</span>
          <ChevronDown size={14} />
        </Link>
      </div>
    </header>
  );
}
