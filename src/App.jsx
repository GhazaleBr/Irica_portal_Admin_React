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
import ProtectedRoute from './Components/Auth/ProtectedRoute'; 
import { getUserInfo } from './services/getuserinfo';
import { Car, LogIn, ShieldAlert } from 'lucide-react';
import NewsManagerModal from './Components/News/NewsManagerModal';
import NewsSearchModal from './Components/News/NewsSearchModal';
import LawsSection from './Components/Laws/LawsManager';
import CreateSubPortal from './Components/SubPortal/CreateSubPortal';
import Card from './Components/ManageCard/Card';
import IamLoginPrompt from './Components/Auth/IamLoginPrompt';
import MediaUploader from './Components/Media/MediaUploader';
import TenderForm from './Components/Tender/TenderForm';
import FormBuilder from './Components/Formbuilder/FormBuilder';
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

    const handleFilesChange = (files) => {
    console.log('فایل‌های آماده ارسال:', files);
    // برای ارسال به سرور می‌توانید از FormData استفاده کنید
  };

    const [activeModal, setActiveModal] = useState(null);

  const newsCardsData = [
    {
      title: 'درج خبر',
      description: 'ثبت و ایجاد خبر جدید در سامانه',
      to: '/addnews/create',
      type: 'create' // مشخص کننده آیکون درج
    },
    {
      title: 'ویرایش خبر',
      description: 'ویرایش، به‌روزرسانی و مدیریت اخبار ثبت‌شده',
      to: '/addnews/edit',
      type: 'edit' // مشخص کننده آیکون ویرایش
    }
  ];

    const lawsCardsData = [
    {
      title: 'درج بخشنامه',
      description: 'ثبت و ایجاد بخشنامه جدید در سامانه',
      to: '/addlaws/create',
      type: 'create' // مشخص کننده آیکون درج
    },
    {
      title: 'ویرایش بخشنامه',
      description: 'ویرایش، به‌روزرسانی و مدیریت بخشنامه ثبت‌شده',
      to: '/addlaws/edit',
      type: 'edit' // مشخص کننده آیکون ویرایش
    }
  ];

  const contractCardsData = [
    {
      title: 'درج قرارداد',
      description: 'ثبت و ایجاد قرارداد جدید در سامانه',
      to: '/addcontract/create',
      type: 'create' // مشخص کننده آیکون درج
    },
    {
      title: 'ویرایش قرارداد',
      description: 'ویرایش، به‌روزرسانی و مدیریت قرارداد ثبت‌شده',
      to: '/addcontract/edit',
      type: 'edit' // مشخص کننده آیکون ویرایش
    }
  ];

    const contentCardsData = [
    {
      title: 'درج محتوا',
      description: 'ثبت و ایجاد محتوا جدید در سامانه',
      to: '/addcontent/create',
      type: 'create' // مشخص کننده آیکون درج
    },
    {
      title: 'ویرایش محتوا',
      description: 'ویرایش، به‌روزرسانی و مدیریت قرارداد ثبت‌شده',
      to: '/addcontent/edit',
      type: 'edit' // مشخص کننده آیکون ویرایش
    }
  ];
  //createcategory

  const categoryCardsData = [
    {
      title: 'درج طبقه‌بندی',
      description: 'ثبت و ایجاد طبقه‌بندی جدید در سامانه',
      to: '/addcategory/create',
      type: 'create' // مشخص کننده آیکون درج
    },
    {
      title: 'ویرایش طبقه‌بندی',
      description: 'ویرایش، به‌روزرسانی و مدیریت طبقه‌بندی ثبت‌شده',
      to: '/addcategory/edit',
      type: 'edit' // مشخص کننده آیکون ویرایش
    }
  ];
    const formCardsData = [
    {
      title: 'درج فرم',
      description: 'ثبت و ایجاد فرم جدید در سامانه',
      to: '/addform/create',
      type: 'create' // مشخص کننده آیکون درج
    },
    {
      title: 'ویرایش فرم',
      description: 'ویرایش، به‌روزرسانی و مدیریت فرم ثبت‌شده',
      to: '/addform/edit',
      type: 'edit' // مشخص کننده آیکون ویرایش
    }
  ];

  const MediaCardsData = [
    {
      title: 'درج چندرسانه‌ای',
      description: 'ثبت و ایجاد چندرسانه‌ای جدید در سامانه',
      to: '/uploadmedia/create',
      type: 'create' // مشخص کننده آیکون درج
    },
    {
      title: 'ویرایش چندرسانه‌ای',
      description: 'ویرایش، به‌روزرسانی و مدیریت چندرسانه‌ای ثبت‌شده',
      to: '/uploadmedia/edit',
      type: 'edit' // مشخص کننده آیکون ویرایش
    }
  ];

    const tenderCardsData = [
    {
      title: 'درج مناقصه',
      description: 'ثبت و ایجاد مناقصه جدید در سامانه',
      to: '/tender/create',
      type: 'create' // مشخص کننده آیکون درج
    },
    {
      title: 'ویرایش مناقصه',
      description: 'ویرایش، به‌روزرسانی و مدیریت مناقصه ثبت‌شده',
      to: '/tender/edit',
      type: 'edit' // مشخص کننده آیکون ویرایش
    }
  ];


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
          {isAuthenticated && (
    <Sidebar onSelect={(menuId) => setSelectedMenu(menuId.split(':')[0])} />
  )}

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
        <IamLoginPrompt onLoginRedirect={handleLoginRedirect} />
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
                  <Card 
                     cards={newsCardsData} 
                     activeModal={activeModal} 
                     setActiveModal={setActiveModal} 
                  />
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
                <Card 
                     cards={lawsCardsData} 
                     activeModal={activeModal} 
                     setActiveModal={setActiveModal} 
                />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addlaws/create"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin', 'news_editor']}
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
                <Card 
                     cards={contractCardsData} 
                     activeModal={activeModal} 
                     setActiveModal={setActiveModal} 
                />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addcontract/create"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin', 'news_editor']}
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
                <Card 
                     cards={contentCardsData} 
                     activeModal={activeModal} 
                     setActiveModal={setActiveModal} 
                />
                  
                </ProtectedRoute>
              }
            />

            <Route
              path="/addcontent/create"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                  //allowedRoles={['admin', 'news_editor']}
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
                <Card 
                     cards={categoryCardsData} 
                     activeModal={activeModal} 
                     setActiveModal={setActiveModal} 
                />
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
                  <BannerCustomizer       mediaModel="/api/admin/media/upload/${mediaModel}"
      onSave={(data) => console.log(data)}/>
                </ProtectedRoute>
              }
            />

            <Route
              path="/createsubportal"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                >
                  <CreateSubPortal/>
                </ProtectedRoute>
              }
            />

            <Route
              path="/uploadmedia"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                >
              
                
                <Card 
                     cards={MediaCardsData} 
                     activeModal={activeModal} 
                     setActiveModal={setActiveModal} 
                />
                {/* <div style={{ padding: '24px' }}>
                <MediaUploader
                  maxSizeMB={25}
                  maxFiles={8}
                  onFilesChange={handleFilesChange}
                />
              </div>*/}
                </ProtectedRoute>
              }
            />

            <Route
              path="/uploadmedia/create"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                >
              
                 <div style={{ padding: '24px' }}>
                <MediaUploader
                  maxSizeMB={25}
                  maxFiles={8}
                  onFilesChange={handleFilesChange}
                />
              </div>
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

            <Route
              path="/addtender"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                >
                  <TenderForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addform"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  isLoadingUser={isLoadingUser}
                  userData={userData}
                >
                  <FormBuilder />
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
