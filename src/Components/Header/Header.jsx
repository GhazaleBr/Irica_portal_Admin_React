import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Bell, Menu, User, LogIn, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import './Header.css';
import CustomIcon from '../../assets/header icon/cust-text2.png';

export default function Header({
  theme = 'light',
  onToggleTheme,
  userProfilePath = '/userprofile',
  iamLoginUrl = import.meta.env?.VITE_IAM_LOGIN_URL || 'https://iam.example.com/login',
  onMenuToggle,
  onNotificationClick,
  token,
  userData,
  isLoadingUser,
  onLogout,
  onLoginSuccess,
}) {
  // ریدایرکت به درگاه IAM
  const handleLoginRedirect = () => {
    const currentOriginUrl = window.location.href.split('#')[0];
    const encodedReturnUrl = encodeURIComponent(currentOriginUrl);
    const separator = iamLoginUrl.includes('?') ? '&' : '?';
    window.location.href = `${iamLoginUrl}${separator}redirect_uri=${encodedReturnUrl}`;
  };

  useEffect(() => {
    const hash = window.location.hash;
    // استخراج توکن از هش بازگشتی IAM
    if (hash && (hash.includes('access_token') || hash.includes('token'))) {
      const params = new URLSearchParams(hash.substring(1));
      const extractedToken = params.get('access_token') || params.get('token');

      if (extractedToken) {
        onLoginSuccess?.(extractedToken);

        // حذف تمیز هش از آدرس مرورگر
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }
    }
  }, [onLoginSuccess]);

  // نمایش نام کاربر
  const getDisplayName = () => {
    if (!userData) return '';
    return userData.fullName || userData.mobile || userData.nationalCode || 'کاربر سامانه';
  };

  const userIsAuthenticated = Boolean(token);

  return (
    <header className="header-container">
      {/* سمت راست: منو، نشان گمرک و عنوان */}
      <div className="header-right">
        {onMenuToggle && (
          <button
            type="button"
            className="header-icon-btn"
            onClick={onMenuToggle}
            title="منوی دسترسی"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="header-logo-box">
          <img src={CustomIcon} alt="نشان گمرک جمهوری اسلامی ایران" />
        </div>

        <div className="header-titles">
          <span className="header-main-title">گمرک جمهوری اسلامی ایران</span>
          <span className="header-sub-title">سامانه جامع امور گمرکی</span>
        </div>
      </div>

      {/* سمت چپ: ابزارها، اعلان و پروفایل */}
      <div className="header-left">
        <button
          type="button"
          className="header-icon-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'تغییر به حالت شب' : 'تغییر به حالت روز'}
        >
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} color="#CE8B0D" />}
        </button>

        <button
          type="button"
          className="header-icon-btn"
          onClick={onNotificationClick}
          title="مشاهده اعلان‌ها"
        >
          <Bell size={19} />
        </button>

        {userIsAuthenticated ? (
          <div className="header-user-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to={userProfilePath}
              className="header-user-btn"
              title={`نقش: ${userData?.role || 'کاربر'}`}
            >
              <User size={18} />
              {isLoadingUser ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <span>{getDisplayName()}</span>
              )}
              <ChevronDown size={14} />
            </Link>

            <button
              type="button"
              className="header-icon-btn"
              onClick={onLogout}
              title="خروج از سامانه"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="header-login-btn"
            title="ورود به سامانه جامع"
          >
            <LogIn size={18} />
            <span>ورود</span>
          </button>
        )}
      </div>
    </header>
  );
}
