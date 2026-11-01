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
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleCardClick = (card) => {
    console.log('کارت انتخاب شده:', card.title);
  };

  return (
    <div className="app-layout" data-theme={theme}>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        
      />

      <div className="main-wrapper">
        <Sidebar onSelect={(menuId) => setSelectedMenu(menuId.split(':')[0])} />

        <main className="content-area">
          {/* محتوا بر اساس آدرس URL عوض می‌شود */}
          <Routes>
            {/* صفحه پیش‌فرض / اصلی */}
            <Route
              path="/"
              element={
                <ServiceCards
                  activeCategory={selectedMenu}
                  onCardClick={handleCardClick}
                />
              }
            />

            {/* صفحه فرم ثبت خبر */}
            <Route path="/addnews" element={<AddNewsForm  />} />
            <Route path="/addlaws" element={<DirectiveAddForm/> }/>
            <Route path="/addcontract" element={<ContractAddForm />} />
            <Route path="/addcontent" element={<ContentAddForm />}/>
            <Route path="/userprofile" element={<UserProfile />}/>
            <Route path="/createcategory" element={<CategoryManager/>}/>
            <Route path="/createbanner" element={<BannerCustomizer/>}/>

            {/* در صورت وارد کردن آدرس اشتباه */}
            <Route path="*" element={<div>صفحه مورد نظر یافت نشد.</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
