// src/components/AddNewsForm/AddNewsForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  postNews,
  uploadImages,
  assignFeaturedImage,
  assignGalleryImage,
} from "../../services/newsService";
import "./AddNewsForm.css";

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
  });

  // فیلدهای چندزبانه + متادیتاها
  const [formData, setFormData] = useState({
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

  // پاک‌سازی حافظه آبجکت‌های URL پیش‌نمایش فایل‌ها
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

  const extractImageId = (response) => {
    return (
      response?.id ??
      response?.data?.id ??
      response?.imageId ??
      response?.data?.imageId ??
      response?.result?.id ??
      response?.result?.imageId ??
      response?.data?.result?.id ??
      response?.data?.result?.imageId ??
      null
    );
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

  const uploadSingleImage = async (file, title, description = "") => {
    const uploadData = new FormData();
    uploadData.append("File", file, file.name);
    uploadData.append("Title", title);
    uploadData.append("Description", description);

    const response = await uploadImages(uploadData);
    const imageId = extractImageId(response);

    if (!imageId) {
      throw new Error("تصویر آپلود شد، اما شناسه آن از سمت سرور بازگردانده نشد.");
    }
    return Number(imageId);
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
      // ۱. آپلود تصویر شاخص
      const featuredImageId = await uploadSingleImage(
        featuredFile,
        formData.titleFa.trim() || formData.titleEn.trim(),
        formData.captionFa.trim() || formData.captionEn.trim()
      );

      // ۲. آپلود تصاویر گالری
      const galleryImageIds = [];
      for (const item of galleryImages) {
        const gId = await uploadSingleImage(
          item.file,
          formData.titleFa.trim() || "Gallery Item",
          ""
        );
        galleryImageIds.push(gId);
      }

      // ۳. ثبت خبر اصلی
      const newsPayload = {
        title: formData.titleFa.trim(),
        titleEn: formData.titleEn.trim(),
        caption: formData.captionFa.trim(),
        captionEn: formData.captionEn.trim(),
        summary: formData.summaryFa.trim(),
        summaryEn: formData.summaryEn.trim(),
        body: formData.contentFa.trim(),
        bodyEn: formData.contentEn.trim(),
        publishDate: formData.publishDate,
        publishTime: getCurrentTimeString(),
        author: formData.author.trim(),
        entityStatusId: Number(formData.status),
        isFeatured: Boolean(formData.isFeatured),
        isBreaking: Boolean(formData.isBreaking),
        categoryIds: [Number(formData.category)],
        imageIds: [featuredImageId, ...galleryImageIds],
      };

      const newsResponse = await postNews(newsPayload);
      const newsId = extractNewsId(newsResponse);

      // ۴. انتساب تصویر شاخص (در صورت نیاز بک‌اند)
      if (newsId) {
        await assignFeaturedImage({
          newsId: newsId,
          imageId: featuredImageId,
          isFeatured: true,
          caption: formData.captionFa.trim(),
          captionEn: formData.captionEn.trim(),
        }).catch((err) => console.warn("انتساب تصویر شاخص انجام نشد:", err));
      }

      // ۵. انتساب تصاویر به گالری خبر
      if (galleryImageIds.length > 0 && newsId) {
        await assignGalleryImage({
          newsId: newsId,
          imageIds: galleryImageIds,
        }).catch((err) => console.warn("انتساب گالری انجام نشد:", err));
      }

      toast.success("خبر با موفقیت ثبت شد.");
      handleClearForm();
    } catch (error) {
      console.error("خطای ثبت خبر:", error);
      const resMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "خطا در ثبت خبر.";
      toast.error(resMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // رادیوباتن‌های تعویض زبان
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
        {/* هدر صفحه */}
        <header className="add-news-header">
          <div>
            <h1 className="page-title">افزودن و ویرایش خبر جدید</h1>
            <p className="page-subtitle">
              سیستم مدیریت اخبار دوزبانه (فارسی / انگلیسی) با قابلیت درج گالری و پیش‌نمایش زنده
            </p>
          </div>
          <div className="header-badge">پنل اخبار و اطلاع‌رسانی</div>
        </header>

        <form onSubmit={handleSubmit} className="news-form" noValidate>
          <div className="form-grid">
            {/* ستون اصلی فرم */}
            <div className="main-column">
              <div className="panel-box">
                <div className="panel-box-header">
                  <h3>محتوای خبر</h3>
                </div>

                {/* ۱. عنوان خبر */}
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

                {/* دسته‌بندی و نویسنده */}
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

                {/* تاریخ و وضعیت انتشار */}
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

                {/* چک‌باکس‌های ویژه و فوری */}
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

                {/* ۲. خلاصه خبر */}
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

                {/* ۳. متن کامل خبر */}
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
              </div>
            </div>

            {/* ستون کناری رسانه و اقدامات */}
            <div className="side-column">
              {/* بخش تصویر شاخص */}
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

                {/* کپشن تصویر شاخص */}
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

              {/* بخش گالری */}
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

              {/* دکمه‌های عملیات */}
              <div className="panel-box">
                <div className="panel-box-header">
                  <h3>عملیات</h3>
                </div>

                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn btn-preview"
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    پیش‌نمایش دو زبانه
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
