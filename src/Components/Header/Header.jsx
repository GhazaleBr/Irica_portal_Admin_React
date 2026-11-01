import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Bell, Menu, User, LogIn, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import { getUserInfo } from '../../services/getuserinfo'; // مسیر فایل سرویس
import './Header.css';
import CustomIcon from '../../assets/header icon/cust-text2.png';

export default function Header({
  theme = 'light',
  onToggleTheme,
  userProfilePath = '/userprofile',
  iamLoginUrl = import.meta.env?.VITE_IAM_LOGIN_URL || 'https://iam.example.com/login',
  onMenuToggle,
  onNotificationClick,
}) {
  const [token, setToken] = useState(() => 
    sessionStorage.getItem('token') || localStorage.getItem('token')
  );

  const [userData, setUserData] = useState(() => {
    const saved = sessionStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // عملیات خروج
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('userData');
    setToken(null);
    setUserData(null);
  };

  // ریدایرکت به درگاه لاگین
  const handleLoginRedirect = () => {
    const currentOriginUrl = window.location.href.split('#')[0];
    const encodedReturnUrl = encodeURIComponent(currentOriginUrl);
    const separator = iamLoginUrl.includes('?') ? '&' : '?';
    window.location.href = `${iamLoginUrl}${separator}redirect_uri=${encodedReturnUrl}`;
  };

  // دریافت اطلاعات با ساختار ارسالی سرور
  const fetchUserProfile = async () => {
    try {
      setIsLoadingUser(true);
      const data = await getUserInfo();
      setUserData(data);
      sessionStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('خطا در دریافت اطلاعات کاربر:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    let activeToken = token;

    // استخراج توکن از هش بازگشتی IAM
    if (hash && (hash.includes('access_token') || hash.includes('token'))) {
      const params = new URLSearchParams(hash.substring(1));
      const extractedToken = params.get('access_token') || params.get('token');

      if (extractedToken) {
        activeToken = extractedToken;
        sessionStorage.setItem('token', extractedToken);
        setToken(extractedToken);

        // حذف هش از URL
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }
    }

    // اگر توکن هست ولی دیتا نداریم، فراخوانی API
    if (activeToken && !userData) {
      fetchUserProfile();
    }
  }, [token]);

  // نمایش نام کاربر منطبق با ساختار API
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
              onClick={handleLogout}
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
