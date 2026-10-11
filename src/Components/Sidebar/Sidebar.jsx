import React, { useState } from 'react';
import {
  Home,
  LayoutGrid,
  Search,
  Megaphone,
  FileText,
  BookOpen,
  User,
  Settings,
  ChevronDown
} from 'lucide-react';
import './Sidebar.css';

const menuItems = [

  {
    id: 'services',
    title: 'ادمین',
    icon: <LayoutGrid size={19} className="sidebar-menu-icon icon-services" />,
    hasChevron: false
    
  },
  {
    id: 'inquiries',
    title: 'روابط عمومی',
    icon: <Search size={19} className="sidebar-menu-icon icon-inquiries" />,
    hasChevron: false
  
  },
  {
    id: 'announcements',
    title: 'دفتر صادرات',
    icon: <Megaphone size={19} className="sidebar-menu-icon icon-notices" />,
    hasChevron: false
    
  },
  {
    id: 'circulars',
    title: 'بخشنامه‌ها',
    icon: <FileText size={19} className="sidebar-menu-icon icon-circulars" />,
    hasChevron: false
   
  },
  {
    id: 'regulations',
    title: 'مقررات',
    icon: <BookOpen size={19} className="sidebar-menu-icon icon-regulations" />,
    hasChevron: false
  },
  {
    id: 'profile',
    title: 'پروفایل',
    icon: <User size={19} className="sidebar-menu-icon icon-profile" />,
    hasChevron: false
    
  },
  {
    id: 'settings',
    title: 'تنظیمات',
    icon: <Settings size={19} className="sidebar-menu-icon icon-settings" />,
    subItems: ['پیکربندی سامانه', 'اعلانات پیامکی']
  }
];

export default function Sidebar({ onSelect }) {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState({});

  const handleToggle = (item) => {
    setActiveItem(item.id);
    if (item.subItems) {
      setOpenSubmenus((prev) => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    }
    if (onSelect) onSelect(item.id);
  };

  return (
    <aside className="customs-sidebar">
      {menuItems.map((item) => {
        const isOpen = !!openSubmenus[item.id];
        const isDashboard = item.isDashboard;
        const hasSub = !!item.subItems || item.hasChevron !== false;

        return (
          <div key={item.id} className="sidebar-group">
            <button
              type="button"
              className={`sidebar-item-btn ${isDashboard ? 'sidebar-item-dashboard' : ''}`}
              onClick={() => handleToggle(item)}
            >
              {/* بخش عنوان و آیکون (راست) */}
              <div className="sidebar-item-content">
                {item.icon}
                <span className="sidebar-item-title">{item.title}</span>
              </div>

              {/* فلش بازشونده (چپ) */}
              {!isDashboard && hasSub && (
                <ChevronDown
                  size={16}
                  className={`sidebar-chevron ${isOpen ? 'open' : ''}`}
                />
              )}
            </button>

            {/* زیرمنوها در صورت باز بودن */}
            {item.subItems && isOpen && (
              <ul className="sidebar-submenu">
                {item.subItems.map((sub, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      className="sidebar-subitem-btn"
                      onClick={() => onSelect && onSelect(`${item.id}:${sub}`)}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );
}
