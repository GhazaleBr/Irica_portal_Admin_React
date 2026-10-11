import React, { useRef, useState } from "react";
import "./UserProfile.css";

const DEFAULT_USER = {
  id: "USR-9842",
  fullNameFa: "علیرضا رضایی",
  fullNameEn: "Alireza Rezaei",
  roleFa: "کارشناس ارشد امور گمرکی و ترخیص کالا",
  roleEn: "Senior Customs Operations Specialist",
  nationalCode: "0018475291",
  personnelCode: "994012",
  customsOffice: "گمرک شهید رجایی / بندرعباس",
  eplAccessLevel: "سطح ۳ (اظهارنامه، بخشنامه‌ها و قراردادها)",
  email: "a.rezaei@customs.ir",
  phoneNumber: "09123456789",
  location: "تهران / هرمزگان",
  joinedDate: "۱۴۰۱/۰۴/۱۵",
  lastLogin: "امروز، ساعت ۱۰:۴۵",
  status: "active",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  stats: {
    directivesRegistered: 48,
    activeContracts: 12,
    publishedContents: 86,
  },
};

const UserProfile = ({ user = DEFAULT_USER, onSaveProfile }) => {
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'system'
  const [lang, setLang] = useState("fa"); // 'fa' | 'en'
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setProfileData((prev) => ({ ...prev, avatarUrl: newUrl }));
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSaveProfile) {
      onSaveProfile(profileData);
    }
  };

  return (
    <div className="profile-page" dir={lang === "fa" ? "rtl" : "ltr"}>
      <div className="profile-container">
        {/* کارت اصلی سربرگ و هویت کاربر */}
        <section className="profile-card-header">
          <div className="profile-cover" />
          <div className="profile-header-content">
            {/* آواتار با قابلیت آپلود */}
            <div className="profile-avatar-wrapper">
              <img
                src={profileData.avatarUrl}
                alt={profileData.fullNameEn}
                className="profile-avatar"
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                className="avatar-upload-badge"
                title="تغییر عکس نمایه"
                onClick={() => fileInputRef.current?.click()}
              >
                📷
              </button>
            </div>

            {/* نام، جایگاه شغلی و وضعیت */}
            <div className="profile-main-meta">
              <h2 className="profile-name">
                {lang === "fa" ? profileData.fullNameFa : profileData.fullNameEn}
                <span className="status-chip active">
                  ● {lang === "fa" ? "کاربر فعال سامانه" : "Active User"}
                </span>
              </h2>
              <p className="profile-role">
                {lang === "fa" ? profileData.roleFa : profileData.roleEn}
              </p>
            </div>

            {/* اکشن‌های دوزبانه و ویرایش */}
            <div className="header-action-group">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setLang((prev) => (prev === "fa" ? "en" : "fa"))}
              >
                🌐 {lang === "fa" ? "English" : "فارسی"}
              </button>

              {isEditing ? (
                <button type="button" className="btn-primary" onClick={handleSave}>
                  💾 {lang === "fa" ? "ذخیره تغییرات" : "Save Changes"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ {lang === "fa" ? "ویرایش نمایه" : "Edit Profile"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* کارت‌های شاخص عملکرد و آمار */}
        <section className="profile-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📜</div>
            <div className="stat-info">
              <span className="stat-value">{profileData.stats.directivesRegistered}</span>
              <span className="stat-label">
                {lang === "fa" ? "بخشنامه‌های ثبت‌شده" : "Registered Directives"}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📑</div>
            <div className="stat-info">
              <span className="stat-value">{profileData.stats.activeContracts}</span>
              <span className="stat-label">
                {lang === "fa" ? "قراردادهای جاری" : "Active Contracts"}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📰</div>
            <div className="stat-info">
              <span className="stat-value">{profileData.stats.publishedContents}</span>
              <span className="stat-label">
                {lang === "fa" ? "محتواهای منتشرشده" : "Published Contents"}
              </span>
            </div>
          </div>
        </section>

        {/* تب‌ها و فیلدهای جزئیات */}
        <section className="profile-tabs-wrapper">
          <div className="profile-tabs-header">
            <button
              type="button"
              className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              {lang === "fa" ? "مشخصات فردی و ارتباطی" : "Personal & Contact Info"}
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "system" ? "active" : ""}`}
              onClick={() => setActiveTab("system")}
            >
              {lang === "fa" ? "اطلاعات سازمانی و دسترسی گمرکی" : "Customs & Access Level"}
            </button>
          </div>

          <div className="profile-tab-content">
            {activeTab === "info" ? (
              <div className="details-grid">
                {/* نام و نام خانوادگی */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "نام و نام خانوادگی (فارسی)" : "Full Name (FA)"}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={profileData.fullNameFa}
                      onChange={(e) => handleInputChange("fullNameFa", e.target.value)}
                    />
                  ) : (
                    <span className="detail-value">{profileData.fullNameFa}</span>
                  )}
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "نام و نام خانوادگی (لاتین)" : "Full Name (EN)"}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      dir="ltr"
                      className="profile-input"
                      value={profileData.fullNameEn}
                      onChange={(e) => handleInputChange("fullNameEn", e.target.value)}
                    />
                  ) : (
                    <span className="detail-value">{profileData.fullNameEn}</span>
                  )}
                </div>

                {/* ایمیل سازمانی */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "پست الکترونیکی" : "Email Address"}
                  </span>
                  {isEditing ? (
                    <input
                      type="email"
                      dir="ltr"
                      className="profile-input"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  ) : (
                    <span className="detail-value" dir="ltr">
                      {profileData.email}
                    </span>
                  )}
                </div>

                {/* شماره تماس */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "شماره تلفن همراه" : "Phone Number"}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      dir="ltr"
                      className="profile-input"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    />
                  ) : (
                    <span className="detail-value" dir="ltr">
                      {profileData.phoneNumber}
                    </span>
                  )}
                </div>

                {/* موقعیت کاری / دفتر */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "حوزه فعالیت و شهر" : "Office / Location"}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="profile-input"
                      value={profileData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  ) : (
                    <span className="detail-value">{profileData.location}</span>
                  )}
                </div>

                {/* تاریخ عضویت */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "تاریخ عضویت در پرتال" : "Registration Date"}
                  </span>
                  <span className="detail-value">{profileData.joinedDate}</span>
                </div>
              </div>
            ) : (
              <div className="details-grid">
                {/* کد پرسنلی */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "کد پرسنلی" : "Personnel ID"}
                  </span>
                  <span className="detail-value">{profileData.personnelCode}</span>
                </div>

                {/* کد ملی */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "کد ملی" : "National Code"}
                  </span>
                  <span className="detail-value">{profileData.nationalCode}</span>
                </div>

                {/* گمرک محل خدمت */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "گمرک اجرایی / محل خدمت" : "Assigned Customs Office"}
                  </span>
                  <span className="detail-value">{profileData.customsOffice}</span>
                </div>

                {/* سطح دسترسی EPL */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "سطح دسترسی سامانه EPL" : "EPL Access Level"}
                  </span>
                  <span className="detail-value">{profileData.eplAccessLevel}</span>
                </div>

                {/* آخرین ورود به سیستم */}
                <div className="detail-item">
                  <span className="detail-label">
                    {lang === "fa" ? "آخرین نشست کاربری فعال" : "Last Activity Log"}
                  </span>
                  <span className="detail-value">{profileData.lastLogin}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
