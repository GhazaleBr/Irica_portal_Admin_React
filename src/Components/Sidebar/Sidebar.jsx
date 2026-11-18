import React, { useState } from 'react';
import './Sidebar.css';

const DEFAULT_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'داشبورد',
    badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'media',
    label: 'مدیریت رسانه',
    badge: 'جدید',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    id: 'uploads',
    label: 'آپلود چندرسانه‌ای',
    badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: 'categories',
    label: 'طبقه‌بندی و برچسب‌ها',
    badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'گزارش‌ها و آمار',
    badge: '۱۲',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'تنظیمات سیستم',
    badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const Sidebar = ({
  activeId = 'uploads',
  onSelect,
  userName = 'کاربر سیستم',
  userRole = 'مدیر محتوا',
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentActive, setCurrentActive] = useState(activeId);

  const handleItemClick = (id) => {
    setCurrentActive(id);
    onSelect?.(id);
  };

  return (
    <aside className={`sb-sidebar ${collapsed ? 'sb-collapsed' : ''}`}>
      {/* هدر سایدبار / برند */}
      <div className="sb-header">
        <div className="sb-brand">
          <div className="sb-brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          {!collapsed && (
            <div className="sb-brand-text">
              <span className="sb-brand-title">مدیریت فایل</span>
              <span className="sb-brand-subtitle">پنل پیشرفته رسانه</span>
            </div>
          )}
        </div>

        {/* دکمه جمع/باز شدن */}
        <button
          type="button"
          className="sb-toggle-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? 'گسترش سایدبار' : 'جمع کردن سایدبار'}
        >
          <svg
            className={`sb-toggle-icon ${collapsed ? 'sb-flipped' : ''}`}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* منوی پیمایش */}
      <nav className="sb-nav">
        <ul className="sb-menu">
          {DEFAULT_MENU_ITEMS.map((item) => {
            const isActive = currentActive === item.id;
            return (
              <li key={item.id} className="sb-menu-item">
                <button
                  type="button"
                  className={`sb-link ${isActive ? 'sb-link-active' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sb-icon">{item.icon}</span>
                  {!collapsed && <span className="sb-label">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="sb-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>


    </aside>
  );
};

export default Sidebar;
