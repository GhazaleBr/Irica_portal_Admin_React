// src/components/AddNewsForm/AddNewsForm.jsx
import React, { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import {
  postNews,
  uploadImages,
  assignFeaturedImage,
  assignGalleryImage,
  getNewsList,
  uploadMediaImage,
  assignNewsImage,
  assignImageToGallery,
  assignGalleryToNews,
} from "../../services/newsService";
import "./AddNewsForm.css";

// ==========================================
// کامپوننت پاپ‌آپ تمام‌صفحه جستجوی اخبار برای ویرایش
// ==========================================
function NewsSearchModal({ show, onHide, onSelectNews }) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("title"); // 'title' | 'author'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      if (typeof getNewsList === "function") {
        const response = await getNewsList({ search: query, searchField: filterType });
        const items = response?.items || response?.data || response || [];
        setResults(items);
      } else {
        // دیتای تستی در صورت عدم دسترسی به سرویس
        const mockData = [
          { id: 1, titleFa: "آخرین اخبار گمرک و ترخیص کالا", author: "علی رضایی" },
          { id: 2, titleFa: "بخشنامه‌های جدید EPL", author: "محمد باقری" },
          { id: 3, titleFa: "راهنمای ثبت سفارش", author: "علی رضایی" },
        ];
        const filtered = mockData.filter((item) => {
          if (filterType === "title") {
            return item.titleFa.toLowerCase().includes(query.toLowerCase());
          } else {
            return item.author.toLowerCase().includes(query.toLowerCase());
          }
        });
        setResults(filtered);
      }
    } catch (error) {
      console.error("خطا در جستجوی اخبار:", error);
      toast.error("خطا در جستجوی اخبار");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="nsm-overlay" onClick={onHide}>
      <div className="nsm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nsm-header">
          <h2 className="nsm-title">جستجو در اخبار جهت ویرایش</h2>
          <button type="button" className="nsm-close" onClick={onHide}>
            ×
          </button>
        </div>

        <form className="nsm-search-form" onSubmit={handleSearch}>
          <select
            className="nsm-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="title">عنوان خبر</option>
            <option value="author">نویسنده</option>
          </select>
          <input
            type="text"
            className="nsm-input"
            placeholder={
              filterType === "title"
                ? "عنوان خبر را وارد کنید..."
                : "نام نویسنده را وارد کنید..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="nsm-btn-search">
            جستجو
          </button>
        </form>

        <div className="nsm-results">
          {loading && <p className="nsm-status">در حال جستجو...</p>}

          {!loading && searched && results.length === 0 && (
            <p className="nsm-status nsm-muted">نتیجه‌ای یافت نشد.</p>
          )}

          {!loading &&
            results.map((news) => (
              <button
                key={news.id}
                type="button"
                className="nsm-item"
                onClick={() => {
                  onSelectNews(news);
                  onHide();
                }}
              >
                <span>{news.titleFa || news.title}</span>
                <span className="nsm-badge">نویسنده: {news.author || "-"}</span>
              </button>
            ))}
        </div>

        <div className="nsm-footer">
          <button type="button" className="nsm-btn-close" onClick={onHide}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// کامپوننت اصلی فرم
// ==========================================
const AddNewsForm = () => {
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const imagePreviewRef = useRef(null);
  const galleryPreviewUrlsRef = useRef([]);

  // وضعیت زبان انتخابی برای هر بخش فرم (fa یا en)
  const [activeLang, setActiveLang] = useState({
    title: "fa",
    summary: "fa",
    content: "fa",
    caption: "fa",
    tags: "fa",
  });

  // فیلدهای چندزبانه + متادیتاها
  const [formData, setFormData] = useState({
    titleFa: "",
    titleEn: "",
    code: "",
    summaryFa: "",
    summaryEn: "",
    contentFa: "",
    contentEn: "",
    captionFa: "",
    captionEn: "",
    category: "",
    publishDate: new Date().toISOString().split("T")[0],
    author: "",
    status: 1,
    provinceId: 0,
    isFeatured: false,
    isBreaking: false,
    isAnimated: false,
    hasSchedule: false,
  });

  // --- وضعیت تگ‌ها ---
  const [tagsFa, setTagsFa] = useState([]);
  const [tagsEn, setTagsEn] = useState([]);
  const [currentTagInputFa, setCurrentTagInputFa] = useState("");
  const [currentTagInputEn, setCurrentTagInputEn] = useState("");

  // --- وضعیت اخبار مرتبط ---
  const [relatedNewsQuery, setRelatedNewsQuery] = useState("");
  const [relatedSearchResults, setRelatedSearchResults] = useState([]);
  const [selectedRelatedNews, setSelectedRelatedNews] = useState([]);
  const [isSearchingNews, setIsSearchingNews] = useState(false);

  // --- وضعیت پاپ‌آپ جستجوی ویرایش ---
  const [isEditSearchOpen, setIsEditSearchOpen] = useState(false);

  const [featuredFile, setFeaturedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const [galleryImages, setGalleryImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTabLang, setPreviewTabLang] = useState("fa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 1, titleFa: "اخبار عمومی", titleEn: "General News" },
    { id: 2, titleFa: "بخشنامه‌ها", titleEn: "Directives & Circulars" },
    { id: 3, titleFa: "اطلاعیه‌ها", titleEn: "Announcements" },
    { id: 4, titleFa: "خدمات گمرکی", titleEn: "Customs Services" },
    { id: 5, titleFa: "آموزش", titleEn: "Education & Training" },
    { id: 6, titleFa: "مناقصات", titleEn: "Tenders" },
    { id: 7, titleFa: "فناوری و سامانه‌ها", titleEn: "IT & Systems" },
  ];

  const statusOptions = [
    { id: 1, titleFa: "پیش‌نویس", titleEn: "Draft" },
    { id: 2, titleFa: "انتشار", titleEn: "Publish" },
    { id: 3, titleFa: "بایگانی", titleEn: "Archive" },
  ];

  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
      galleryPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLangToggle = (field, lang) => {
    setActiveLang((prev) => ({ ...prev, [field]: lang }));
  };

  const handleAddTag = (lang = "fa") => {
    if (lang === "fa") {
      const val = currentTagInputFa.trim();
      if (!val) return;
      if (tagsFa.includes(val)) {
        toast.info("این برچسب قبلاً اضافه شده است.");
        return;
      }
      setTagsFa((prev) => [...prev, val]);
      setCurrentTagInputFa("");
    } else {
      const val = currentTagInputEn.trim();
      if (!val) return;
      if (tagsEn.includes(val)) {
        toast.info("Tag already exists.");
        return;
      }
      setTagsEn((prev) => [...prev, val]);
      setCurrentTagInputEn("");
    }
  };

  const handleRemoveTag = (indexToRemove, lang = "fa") => {
    if (lang === "fa") {
      setTagsFa((prev) => prev.filter((_, i) => i !== indexToRemove));
    } else {
      setTagsEn((prev) => prev.filter((_, i) => i !== indexToRemove));
    }
  };

  const handleTagKeyDown = (e, lang) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(lang);
    }
  };

  // انتخاب خبر از پاپ‌آپ جستجوی ویرایش جهت بارگذاری در فرم
  const handleSelectNewsForEdit = (newsItem) => {
    console.log("خبر انتخاب شده برای ویرایش:", newsItem);
    // پر کردن فرم با اطلاعات خبر انتخابی (می‌توانید فیلدها را بر اساس ساختار پاسخ API مپ کنید)
    setFormData((prev) => ({
      ...prev,
      titleFa: newsItem.titleFa || newsItem.title || "",
      titleEn: newsItem.titleEn || "",
      summaryFa: newsItem.summaryFa || newsItem.summary || "",
      summaryEn: newsItem.summaryEn || "",
      contentFa: newsItem.bodyFa || newsItem.content || "",
      contentEn: newsItem.bodyEn || "",
      author: newsItem.author || "",
      category: newsItem.categoryId || newsItem.category || "",
      status: newsItem.entityStatusId || newsItem.status || 1,
    }));
    toast.success("اطلاعات خبر برای ویرایش بارگذاری شد.");
  };

  const handleSearchRelatedNews = async (e) => {
    const query = e.target.value;
    setRelatedNewsQuery(query);

    if (!query.trim() || query.length < 2) {
      setRelatedSearchResults([]);
      return;
    }

    try {
      setIsSearchingNews(true);
      if (typeof getNewsList === "function") {
        const response = await getNewsList({ search: query, pageSize: 5 });
        const items = response?.items || response?.data || response || [];
        setRelatedSearchResults(items);
      } else {
        setRelatedSearchResults([
          { id: 101, title: `خبر مرتبط: ${query} در گمرک`, publishDate: "1403/07/20" },
          { id: 102, title: `دستورالعمل جامع مرتبط با ${query}`, publishDate: "1403/07/18" },
        ]);
      }
    } catch (err) {
      console.error("خطا در واکشی اخبار جهت ارتباط:", err);
    } finally {
      setIsSearchingNews(false);
    }
  };

  const handleSelectRelatedNews = (newsItem) => {
    if (selectedRelatedNews.some((item) => item.id === newsItem.id)) {
      toast.info("این خبر قبلاً به عنوان خبر مرتبط انتخاب شده است.");
      return;
    }
    setSelectedRelatedNews((prev) => [...prev, newsItem]);
    setRelatedNewsQuery("");
    setRelatedSearchResults([]);
  };

  const handleRemoveRelatedNews = (idToRemove) => {
    setSelectedRelatedNews((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("لطفاً یک فایل تصویری معتبر انتخاب کنید.");
      return;
    }

    if (imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    imagePreviewRef.current = previewUrl;

    setFeaturedFile(file);
    setSelectedFileName(file.name);
    setImagePreview(previewUrl);

    if (errors.featuredImage) {
      setErrors((prev) => ({ ...prev, featuredImage: "" }));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 3 - galleryImages.length;
    if (files.length > remainingSlots) {
      toast.error("شما حداکثر می‌توانید ۳ تصویر برای گالری انتخاب کنید.");
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      toast.error("تمام فایل‌های گالری باید فرمت تصویری داشته باشند.");
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    const newGalleryItems = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      galleryPreviewUrlsRef.current.push(previewUrl);
      return { file, preview: previewUrl, name: file.name };
    });

    setGalleryImages((prev) => [...prev, ...newGalleryItems]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryImage = (indexToRemove) => {
    setGalleryImages((prev) => {
      const targetImage = prev[indexToRemove];
      if (targetImage?.preview) {
        URL.revokeObjectURL(targetImage.preview);
        galleryPreviewUrlsRef.current = galleryPreviewUrlsRef.current.filter(
          (url) => url !== targetImage.preview
        );
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titleFa.trim()) newErrors.titleFa = "عنوان فارسی خبر الزامی است.";
    if (!formData.category) newErrors.category = "دسته‌بندی را انتخاب کنید.";
    if (!formData.summaryFa.trim()) newErrors.summaryFa = "خلاصه فارسی الزامی است.";
    if (!formData.contentFa.trim()) newErrors.contentFa = "متن فارسی الزامی است.";
    if (!formData.publishDate.trim()) newErrors.publishDate = "تاریخ انتشار را وارد کنید.";
    if (!formData.author.trim()) newErrors.author = "نام نویسنده الزامی است.";
    if (!featuredFile) newErrors.featuredImage = "انتخاب تصویر شاخص الزامی است.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const extractNewsId = (response) => {
    return (
      response?.id ??
      response?.data?.id ??
      response?.newsId ??
      response?.data?.newsId ??
      response?.result?.id ??
      response?.data?.result?.id ??
      null
    );
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  };

  const handleClearForm = () => {
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
    galleryPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    galleryPreviewUrlsRef.current = [];

    setFormData({
      titleFa: "",
      titleEn: "",
      summaryFa: "",
      summaryEn: "",
      contentFa: "",
      contentEn: "",
      captionFa: "",
      captionEn: "",
      category: "",
      publishDate: "",
      author: "",
      status: 1,
      isFeatured: false,
      isBreaking: false,
    });

    setTagsFa([]);
    setTagsEn([]);
    setSelectedRelatedNews([]);
    setRelatedSearchResults([]);
    setRelatedNewsQuery("");

    setFeaturedFile(null);
    setImagePreview(null);
    setSelectedFileName("");
    setGalleryImages([]);
    setErrors({});
    setIsPreviewOpen(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("لطفاً فیلدهای الزامی فرم را تکمیل فرمایید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const currentFormattedTime = getCurrentTimeString();

      const newsPayload = {
        title: formData.titleFa.trim(),
        caption: formData.captionFa.trim() || "",
        code: formData.code.trim() || `NEWS-${Date.now().toString().slice(-6)}`,
        summaryFa: formData.summaryFa.trim(),
        summaryEn: formData.summaryEn.trim() || "",
        bodyFa: formData.contentFa.trim(),
        bodyEn: formData.contentEn.trim() || "",
        publishDate: formData.publishDate,
        publishTime: currentFormattedTime,
        entityStatusId: Number(formData.status) || 1,
        hasSchedule: Boolean(formData.hasSchedule),
        scheduleStartDate: formData.publishDate,
        scheduleStartTime: currentFormattedTime,
        scheduleEndDate: formData.publishDate,
        scheduleEndTime: currentFormattedTime,
        isBreaking: Boolean(formData.isBreaking),
        isAnimated: Boolean(formData.isAnimated),
        isFeatured: Boolean(formData.isFeatured),
        provinceId: Number(formData.provinceId) || 0,
        deactivateAt: "2026-10-19T04:33:00.066Z"
      };

      const newsResponse = await postNews(newsPayload);
      const newsId = extractNewsId(newsResponse);

      if (!newsId) {
        throw new Error("خبر در پایگاه داده ایجاد شد، اما شناسه آن (News ID) دریافت نشد.");
      }

      if (featuredFile) {
        const uploadResponse = await uploadMediaImage(
          featuredFile,
          formData.titleFa.trim() || "عنوان تصویر",
          "news"
        );
        const imageId = uploadResponse?.id || uploadResponse?.data?.id;

        if (imageId) {
          await assignNewsImage({
            newsId,
            imageId,
            sortOrder: 0,
            typeId: 2,
            languageId: 0,
          });
        }
      }

      toast.success("خبر و کلیه مستندات تصویری با موفقیت ثبت شد.");
      handleClearForm();
    } catch (error) {
      console.error("خطای ثبت خبر:", error);
      const resMsg =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.response?.data?.error ||
        error?.message ||
        "خطا در ثبت خبر.";
      toast.error(resMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLanguageSwitch = (fieldKey) => (
    <div className="lang-radio-group">
      <label className={`lang-radio-pill ${activeLang[fieldKey] === "fa" ? "active" : ""}`}>
        <input
          type="radio"
          name={`lang-${fieldKey}`}
          value="fa"
          checked={activeLang[fieldKey] === "fa"}
          onChange={() => handleLangToggle(fieldKey, "fa")}
        />
        <span>فارسی</span>
      </label>
      <label className={`lang-radio-pill ${activeLang[fieldKey] === "en" ? "active" : ""}`}>
        <input
          type="radio"
          name={`lang-${fieldKey}`}
          value="en"
          checked={activeLang[fieldKey] === "en"}
          onChange={() => handleLangToggle(fieldKey, "en")}
        />
        <span>English (EN)</span>
      </label>
    </div>
  );

  const selectedCat = categories.find((c) => String(c.id) === String(formData.category));

  return (
    <div className="add-news-page" dir="rtl">
      <div className="add-news-container">
        <header className="add-news-header">
          <div>
            <h1 className="page-title">افزودن و ویرایش خبر جدید</h1>
            <p className="page-subtitle">
              سیستم مدیریت اخبار دوزبانه (فارسی / انگلیسی) با قابلیت برچسب‌گذاری، اخبار مرتبط و گالری
            </p>
          </div>
          <div className="header-badge">پنل اخبار و اطلاع‌رسانی</div>
        </header>

        <form onSubmit={handleSubmit} className="news-form" noValidate>
          <div className="form-grid">
            <div className="main-column">
              <div className="panel-box">
                <div className="panel-box-header">
                  <h3>محتوای خبر</h3>
                </div>

                <div className="form-group">
                  <div className="field-header-row">
                    <label className="form-label">
                      عنوان خبر {activeLang.title === "en" ? "(English Title)" : "(فارسی)"}
                    </label>
                    {renderLanguageSwitch("title")}
                  </div>

                  {activeLang.title === "fa" ? (
                    <input
                      type="text"
                      name="titleFa"
                      dir="rtl"
                      className={`form-input ${errors.titleFa ? "input-error" : ""}`}
                      placeholder="عنوان کامل فارسی خبر..."
                      value={formData.titleFa}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type="text"
                      name="titleEn"
                      dir="ltr"
                      className="form-input ltr-input"
                      placeholder="Enter news title in English..."
                      value={formData.titleEn}
                      onChange={handleChange}
                    />
                  )}
                  {errors.titleFa && activeLang.title === "fa" && (
                    <span className="error-text">{errors.titleFa}</span>
                  )}
                </div>

                <div className="two-col">
                  <div className="form-group">
                    <label className="form-label">دسته‌بندی</label>
                    <select
                      name="category"
                      className={`form-input ${errors.category ? "input-error" : ""}`}
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">انتخاب دسته‌بندی</option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.titleFa} / {item.titleEn}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className="error-text">{errors.category}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">نویسنده / منبع</label>
                    <input
                      type="text"
                      name="author"
                      className={`form-input ${errors.author ? "input-error" : ""}`}
                      placeholder="نام نویسنده یا اداره مربوطه"
                      value={formData.author}
                      onChange={handleChange}
                    />
                    {errors.author && (
                      <span className="error-text">{errors.author}</span>
                    )}
                  </div>
                </div>

                <div className="two-col">
                  <div className="form-group">
                    <label className="form-label">تاریخ انتشار</label>
                    <input
                      type="date"
                      name="publishDate"
                      className={`form-input ${errors.publishDate ? "input-error" : ""}`}
                      value={formData.publishDate}
                      onChange={handleChange}
                    />
                    {errors.publishDate && (
                      <span className="error-text">{errors.publishDate}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">وضعیت خبر</label>
                    <select
                      name="status"
                      className="form-input"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.titleFa} ({item.titleEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="checkbox-row">
                  <label className="custom-check-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                    />
                    <span>خبر ویژه (Featured)</span>
                  </label>

                  <label className="custom-check-label">
                    <input
                      type="checkbox"
                      name="isBreaking"
                      checked={formData.isBreaking}
                      onChange={handleChange}
                    />
                    <span>خبر فوری (Breaking)</span>
                  </label>
                </div>

                <div className="form-group">
                  <div className="field-header-row">
                    <label className="form-label">
                      خلاصه خبر {activeLang.summary === "en" ? "(English Summary)" : "(فارسی)"}
                    </label>
                    {renderLanguageSwitch("summary")}
                  </div>

                  {activeLang.summary === "fa" ? (
                    <textarea
                      name="summaryFa"
                      dir="rtl"
                      rows={3}
                      className={`form-input textarea ${errors.summaryFa ? "input-error" : ""}`}
                      placeholder="خلاصه کوتاه خبر به زبان فارسی..."
                      value={formData.summaryFa}
                      onChange={handleChange}
                    />
                  ) : (
                    <textarea
                      name="summaryEn"
                      dir="ltr"
                      rows={3}
                      className="form-input textarea ltr-input"
                      placeholder="Write brief news summary in English..."
                      value={formData.summaryEn}
                      onChange={handleChange}
                    />
                  )}
                  {errors.summaryFa && activeLang.summary === "fa" && (
                    <span className="error-text">{errors.summaryFa}</span>
                  )}
                </div>

                <div className="form-group">
                  <div className="field-header-row">
                    <label className="form-label">
                      متن کامل خبر {activeLang.content === "en" ? "(English Body)" : "(فارسی)"}
                    </label>
                    {renderLanguageSwitch("content")}
                  </div>

                  {activeLang.content === "fa" ? (
                    <textarea
                      name="contentFa"
                      dir="rtl"
                      rows={9}
                      className={`form-input textarea ${errors.contentFa ? "input-error" : ""}`}
                      placeholder="متن کامل فارسی خبر را وارد کنید..."
                      value={formData.contentFa}
                      onChange={handleChange}
                    />
                  ) : (
                    <textarea
                      name="contentEn"
                      dir="ltr"
                      rows={9}
                      className="form-input textarea ltr-input"
                      placeholder="Type the full news article content in English..."
                      value={formData.contentEn}
                      onChange={handleChange}
                    />
                  )}
                  {errors.contentFa && activeLang.content === "fa" && (
                    <span className="error-text">{errors.contentFa}</span>
                  )}
                </div>

                <div className="form-group">
                  <div className="field-header-row">
                    <label className="form-label">
                      برچسب‌های خبر {activeLang.tags === "en" ? "(Tags - English)" : "(فارسی)"}
                    </label>
                    {renderLanguageSwitch("tags")}
                  </div>

                  {activeLang.tags === "fa" ? (
                    <div className="tags-input-container">
                      <div className="tags-input-row">
                        <input
                          type="text"
                          dir="rtl"
                          className="form-input"
                          placeholder="برچسب را تایپ کنید و Enter بزنید..."
                          value={currentTagInputFa}
                          onChange={(e) => setCurrentTagInputFa(e.target.value)}
                          onKeyDown={(e) => handleTagKeyDown(e, "fa")}
                        />
                        <button
                          type="button"
                          className="btn-add-tag"
                          onClick={() => handleAddTag("fa")}
                        >
                          افزودن برچسب
                        </button>
                      </div>
                      <div className="tags-list">
                        {tagsFa.map((tag, idx) => (
                          <span key={idx} className="tag-chip">
                            #{tag}
                            <button
                              type="button"
                              className="tag-remove-btn"
                              onClick={() => handleRemoveTag(idx, "fa")}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="tags-input-container" dir="ltr">
                      <div className="tags-input-row">
                        <input
                          type="text"
                          dir="ltr"
                          className="form-input ltr-input"
                          placeholder="Type tag and press Enter..."
                          value={currentTagInputEn}
                          onChange={(e) => setCurrentTagInputEn(e.target.value)}
                          onKeyDown={(e) => handleTagKeyDown(e, "en")}
                        />
                        <button
                          type="button"
                          className="btn-add-tag"
                          onClick={() => handleAddTag("en")}
                        >
                          Add Tag
                        </button>
                      </div>
                      <div className="tags-list">
                        {tagsEn.map((tag, idx) => (
                          <span key={idx} className="tag-chip">
                            #{tag}
                            <button
                              type="button"
                              className="tag-remove-btn"
                              onClick={() => handleRemoveTag(idx, "en")}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group related-news-section">
                  <label className="form-label">انتخاب و اتصال اخبار مرتبط</label>
                  <div className="related-search-box">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="عنوان خبر مورد نظر را جهت جستجو وارد نمایید..."
                      value={relatedNewsQuery}
                      onChange={handleSearchRelatedNews}
                    />
                    {isSearchingNews && <div className="searching-spinner">در حال جستجو...</div>}

                    {relatedSearchResults.length > 0 && (
                      <ul className="related-dropdown-results">
                        {relatedSearchResults.map((item) => (
                          <li
                            key={item.id}
                            onClick={() => handleSelectRelatedNews(item)}
                            className="related-dropdown-item"
                          >
                            <span className="related-item-title">{item.title || item.titleFa}</span>
                            {item.publishDate && (
                              <span className="related-item-date">{item.publishDate}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="selected-related-list">
                    {selectedRelatedNews.length === 0 ? (
                      <p className="no-related-text">هیچ خبر مرتبطی انتخاب نشده است.</p>
                    ) : (
                      selectedRelatedNews.map((news) => (
                        <div key={news.id} className="selected-related-card">
                          <span className="related-card-title">{news.title || news.titleFa}</span>
                          <button
                            type="button"
                            className="related-remove-btn"
                            onClick={() => handleRemoveRelatedNews(news.id)}
                            title="حذف خبر مرتبط"
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="side-column">
              <div className="panel-box">
                <div className="panel-box-header">
                  <h3>تصویر شاخص</h3>
                </div>

                <div
                  className="upload-box"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="پیش‌نمایش تصویر شاخص"
                      className="preview-image"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">+</div>
                      <p>انتخاب تصویر شاخص</p>
                      <span>PNG / JPG / WEBP</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {selectedFileName && (
                  <div className="file-name">فایل: {selectedFileName}</div>
                )}
                {errors.featuredImage && (
                  <span className="error-text">{errors.featuredImage}</span>
                )}

                <div className="form-group mt-3">
                  <div className="field-header-row">
                    <label className="form-label">کپشن تصویر</label>
                    {renderLanguageSwitch("caption")}
                  </div>

                  {activeLang.caption === "fa" ? (
                    <input
                      type="text"
                      name="captionFa"
                      dir="rtl"
                      className="form-input"
                      placeholder="توضیح فارسی تصویر..."
                      value={formData.captionFa}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type="text"
                      name="captionEn"
                      dir="ltr"
                      className="form-input ltr-input"
                      placeholder="Image caption in English..."
                      value={formData.captionEn}
                      onChange={handleChange}
                    />
                  )}
                </div>
              </div>

              <div className="panel-box">
                <div className="panel-box-header">
                  <h3>گالری تصاویر ({galleryImages.length}/3)</h3>
                </div>

                {galleryImages.length < 3 ? (
                  <div
                    className="gallery-upload-btn"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <span className="plus-sign">+</span>
                    <span>افزودن عکس به گالری</span>
                  </div>
                ) : (
                  <div className="gallery-limit-alert">
                    حداکثر ۳ تصویر قابل انتخاب است.
                  </div>
                )}

                <input
                  ref={galleryInputRef}
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleGalleryChange}
                />

                <div className="gallery-grid">
                  {galleryImages.map((img, index) => (
                    <div key={index} className="gallery-item-wrapper">
                      <img
                        src={img.preview}
                        alt={`تصویر گالری ${index + 1}`}
                        className="gallery-thumb"
                      />
                      <button
                        type="button"
                        className="btn-delete-image"
                        onClick={() => removeGalleryImage(index)}
                        title="حذف تصویر"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-box">
                <div className="panel-box-header">
                  <h3>عملیات</h3>
                </div>

                <div className="action-buttons">
                  {/* دکمه ویرایش که پاپ‌آپ جستجو را باز می‌کند */}
                  <button
                    type="button"
                    className="btn btn-preview"
                    onClick={() => setIsEditSearchOpen(true)}
                  >
                    ویرایش
                  </button>

                  <button
                    type="button"
                    className="btn btn-preview"
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    پیش‌نمایش
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClearForm}
                    disabled={isSubmitting}
                  >
                    پاک‌سازی فرم
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "در حال ارسال..." : "ثبت و ارسال خبر"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* پاپ‌آپ تمام‌صفحه جستجوی اخبار جهت ویرایش */}
        <NewsSearchModal
          show={isEditSearchOpen}
          onHide={() => setIsEditSearchOpen(false)}
          onSelectNews={handleSelectNewsForEdit}
        />

        {/* مودال پیش‌نمایش دو زبانه */}
        {isPreviewOpen && (
          <div
            className="preview-modal-overlay"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="news-preview-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="preview-modal-header">
                <div>
                  <span className="preview-label">پیش‌نمایش خروجی خبر</span>
                  <div className="preview-lang-tabs">
                    <button
                      type="button"
                      className={`tab-btn ${previewTabLang === "fa" ? "active" : ""}`}
                      onClick={() => setPreviewTabLang("fa")}
                    >
                      نسخه فارسی
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${previewTabLang === "en" ? "active" : ""}`}
                      onClick={() => setPreviewTabLang("en")}
                    >
                      English Version
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="close-preview-btn"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  ×
                </button>
              </div>

              <div
                className={`preview-body-container ${previewTabLang === "en" ? "en-mode" : "fa-mode"}`}
                dir={previewTabLang === "en" ? "ltr" : "rtl"}
              >
                <h2 className="preview-headline">
                  {previewTabLang === "fa"
                    ? formData.titleFa || "بدون عنوان فارسی"
                    : formData.titleEn || "No English Title Entered"}
                </h2>

                <div className="preview-meta">
                  <span>
                    {previewTabLang === "fa" ? "دسته‌بندی: " : "Category: "}
                    {previewTabLang === "fa"
                      ? selectedCat?.titleFa || "نامشخص"
                      : selectedCat?.titleEn || "Not Specified"}
                  </span>
                  <span>
                    {previewTabLang === "fa" ? "نویسنده: " : "Author: "}
                    {formData.author || "-"}
                  </span>
                  <span>
                    {previewTabLang === "fa" ? "تاریخ: " : "Date: "}
                    {formData.publishDate || "-"}
                  </span>
                  {formData.isFeatured && (
                    <span className="preview-badge featured">
                      ★ {previewTabLang === "fa" ? "ویژه" : "Featured"}
                    </span>
                  )}
                  {formData.isBreaking && (
                    <span className="preview-badge breaking">
                      ⚡ {previewTabLang === "fa" ? "فوری" : "Breaking"}
                    </span>
                  )}
                </div>

                <div className="preview-main-content">
                  <aside className="preview-featured-image-box">
                    {imagePreview ? (
                      <figure className="preview-featured-figure">
                        <img
                          src={imagePreview}
                          alt="Featured"
                          className="preview-featured-image"
                        />
                        {(previewTabLang === "fa"
                          ? formData.captionFa
                          : formData.captionEn) && (
                          <figcaption className="preview-featured-caption">
                            {previewTabLang === "fa"
                              ? formData.captionFa
                              : formData.captionEn}
                          </figcaption>
                        )}
                      </figure>
                    ) : (
                      <div className="preview-no-image">فاقد تصویر شاخص</div>
                    )}
                  </aside>

                  <article className="preview-article-content">
                    <p className="preview-summary">
                      {previewTabLang === "fa"
                        ? formData.summaryFa || "خلاصه فارسی وارد نشده است."
                        : formData.summaryEn || "No English summary provided."}
                    </p>
                    <div className="preview-content-text">
                      {previewTabLang === "fa"
                        ? formData.contentFa || "متن کامل فارسی وارد نشده است."
                        : formData.contentEn || "No English content provided."}
                    </div>

                    {((previewTabLang === "fa" && tagsFa.length > 0) ||
                      (previewTabLang === "en" && tagsEn.length > 0)) && (
                      <div className="preview-tags-section">
                        <h4>{previewTabLang === "fa" ? "برچسب‌ها:" : "Tags:"}</h4>
                        <div className="preview-tags-list">
                          {(previewTabLang === "fa" ? tagsFa : tagsEn).map((t, i) => (
                            <span key={i} className="preview-tag-item">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRelatedNews.length > 0 && (
                      <div className="preview-related-section">
                        <h4>{previewTabLang === "fa" ? "اخبار مرتبط:" : "Related News:"}</h4>
                        <ul className="preview-related-items">
                          {selectedRelatedNews.map((rn) => (
                            <li key={rn.id}>{rn.title || rn.titleFa}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                </div>

                {galleryImages.length > 0 && (
                  <section className="preview-gallery-section">
                    <h3>{previewTabLang === "fa" ? "تصاویر گالری" : "Gallery Images"}</h3>
                    <div className="preview-gallery-grid">
                      {galleryImages.map((img, index) => (
                        <div className="preview-gallery-item" key={index}>
                          <img src={img.preview} alt={`Gallery ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="preview-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddNewsForm;
