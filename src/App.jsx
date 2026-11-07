import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Components/Header/Header';
import Sidebar from './Components/Sidebar/Sidebar';
import ServiceCards from './Components/ServiceCard/ServiceCards';
import AddNewsForm from './Components/News/AddNewsForm';
import DirectiveAddForm from './Components/Laws/DirectiveAddForm';
import ContractAddForm from './Components/Contract/ContractAddForm';
import ContentAddForm from './Components/Content/ContentAddForm';
import UserProfile from './Components/UserProfile/UserProfile';
import CategoryManager from './Components/CategoryManager/CategoryManager';
import BannerCustomizer from './Components/BannerManager/BannerCustomizer';
import ProtectedRoute from './Components/Auth/ProtectedRoute'; // <-- ایمپورت کامپوننت محافظت
import { getUserInfo } from './services/getuserinfo';
import { LogIn, ShieldAlert } from 'lucide-react';
import NewsManagerModal from './Components/News/NewsManagerModal';
import NewsSearchModal from './Components/News/NewsSearchModal';
import './App.css';

const IAM_LOGIN_URL = import.meta.env?.VITE_IAM_LOGIN_URL || 'https://iam.example.com/login';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');

  
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  // استیت توکن از سشن
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));

  // استیت اطلاعات کاربر
  const [userData, setUserData] = useState(() => {
    const saved = sessionStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // تم
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // دریافت اطلاعات کاربر در صورت داشتن توکن
  const fetchUserProfile = async () => {
    try {
      setIsLoadingUser(true);
      const data = await getUserInfo();
      setUserData(data);
      sessionStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('خطا در دریافت اطلاعات کاربر:', error);
      if (error?.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    if (token && !userData) {
      fetchUserProfile();
    }
  }, [token]);

  // ثبت ورود موفق
  const handleLoginSuccess = (newToken) => {
    sessionStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // عملیات خروج کامل
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');
    localStorage.removeItem('token');
    setToken(null);
    setUserData(null);
  };

  // هدایت مستقیم به درگاه ورود سامانه IAM
  const handleLoginRedirect = () => {
    const currentOriginUrl = window.location.href.split('#')[0];
    const encodedReturnUrl = encodeURIComponent(currentOriginUrl);
    const separator = IAM_LOGIN_URL.includes('?') ? '&' : '?';
    window.location.href = `${IAM_LOGIN_URL}${separator}redirect_uri=${encodedReturnUrl}`;
  };

  const handleCardClick = (card) => {
    console.log('کارت انتخاب شده:', card.title);
  };

  const isAuthenticated = Boolean(token);

  return (
    <div className="app-layout" data-theme={theme}>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        token={token}
        userData={userData}
        isLoadingUser={isLoadingUser}
        onLogout={handleLogout}
        onLoginSuccess={handleLoginSuccess}
        iamLoginUrl={IAM_LOGIN_URL}
      />

      <div className="main-wrapper">
        {/*<Sidebar onSelect={(menuId) => setSelectedMenu(menuId.split(':')[0])} />*/}

        <main className="content-area">
          <Routes>
            {/* صفحه پیش‌فرض / اصلی */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <ServiceCards
                    activeCategory={selectedMenu}
                    onCardClick={handleCardClick}
                  />
                ) : (
                  <div className="auth-card-container">
                    <div className="auth-card">
                      <div className="auth-icon-wrapper">
                        <ShieldAlert size={48} className="auth-lock-icon" />
                      </div>
                      <h3>ورود به سامانه مدیریت پورتال گمرک</h3>
                      <p>
                        جهت مشاهده خدمات، لطفاً از طریق درگاه احراز هویت مرکزی وارد شوید.
                      </p>
                      <button
                        type="button"
                        className="btn-login-gateway"
                        onClick={handleLoginRedirect}
                      >
                        <LogIn size={18} />
                        <span>ورود از طریق درگاه مرکزی (IAM)</span>
                      </button>
                    </div>
                  </div>
                )
              }
            />

            {/* مسیرهای محافظت‌شده بر اساس توکن و نقش */}
            <Route
              path="/addnews"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin', 'news_editor']}
                >
                  <NewsManagerModal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addnews/create"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin', 'news_editor']}
                >
                  <AddNewsForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addnews/edit"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin', 'news_editor']}
                >
                  <NewsSearchModal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addlaws"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin', 'legal_expert']}
                >
                  <DirectiveAddForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addcontract"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                 // allowedRoles={['admin', 'contract_manager']}
                >
                  <ContractAddForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addcontent"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin', 'content_manager']}
                >
                  <ContentAddForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/createcategory"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin']}
                >
                  <CategoryManager />
                </ProtectedRoute>
              }
            />

            <Route
              path="/createbanner"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin']}
                >
                  <BannerCustomizer />
                </ProtectedRoute>
              }
            />

            {/* پروفایل کاربر فقط نیاز به لاگین بودن دارد و نقش خاصی نیاز ندارد */}
            <Route
              path="/userprofile"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                >
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<div>صفحه مورد نظر یافت نشد.</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
