import React, { useMemo, useRef, useState } from "react";
import "./ContentAddForm.css";

// فهرست طبقه‌بندی‌های موضوعی محتوا
const CONTENT_CATEGORIES = [
  { value: "news", labelFa: "اخبار و رویدادها", labelEn: "News & Events" },
  { value: "announcements", labelFa: "اطلاعیه‌ها و ابلاغیه‌ها", labelEn: "Announcements & Notices" },
  { value: "customs_regulations", labelFa: "مقررات و رویه‌های گمرکی", labelEn: "Customs Regulations" },
  { value: "foreign_trade", labelFa: "تجارت خارجی و ترخیص کالا", labelEn: "Foreign Trade & Clearance" },
  { value: "logistics_transport", labelFa: "حمل‌ونقل و لجستیک", labelEn: "Logistics & Transport" },
  { value: "reports", labelFa: "گزارش‌های تحلیلی و آماری", labelEn: "Analytical Reports" },
];

const ContentAddForm = ({ onSubmit }) => {
  const [data, setData] = useState({
    category: "",
    titleFa: "",
    titleEn: "",
    summaryFa: "",
    summaryEn: "",
    descriptionFa: "",
    descriptionEn: "",
    startDateTime: "",
    endDateTime: "",
  });

  const [keywordsFa, setKeywordsFa] = useState([]);
  const [keywordsEn, setKeywordsEn] = useState([]);
  const [tempKeywordFa, setTempKeywordFa] = useState("");
  const [tempKeywordEn, setTempKeywordEn] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState("fa");

  // تب فعال برای فیلدهای دوزبانه
  const [activeLang, setActiveLang] = useState({
    title: "fa",
    summary: "fa",
    description: "fa",
    keywords: "fa",
  });

  const imageInputRef = useRef(null);

  const handleLangToggle = (fieldKey, lang) => {
    setActiveLang((prev) => ({ ...prev, [fieldKey]: lang }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // مدیریت تصویر شاخص
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "لطفاً یک فایل تصویری معتبر انتخاب کنید." }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد." }));
        return;
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // مدیریت کلمات کلیدی
  const handleAddKeyword = (lang) => {
    if (lang === "fa" && tempKeywordFa.trim()) {
      if (!keywordsFa.includes(tempKeywordFa.trim())) {
        setKeywordsFa((prev) => [...prev, tempKeywordFa.trim()]);
      }
      setTempKeywordFa("");
    } else if (lang === "en" && tempKeywordEn.trim()) {
      if (!keywordsEn.includes(tempKeywordEn.trim())) {
        setKeywordsEn((prev) => [...prev, tempKeywordEn.trim()]);
      }
      setTempKeywordEn("");
    }
  };

  const handleRemoveKeyword = (lang, tag) => {
    if (lang === "fa") {
      setKeywordsFa((prev) => prev.filter((k) => k !== tag));
    } else {
      setKeywordsEn((prev) => prev.filter((k) => k !== tag));
    }
  };

  // اعتبارسنجی
  const validate = () => {
    const newErrors = {};

    if (!data.category) {
      newErrors.category = "لطفاً طبقه‌بندی محتوا را انتخاب کنید.";
    }
    if (!data.titleFa.trim()) {
      newErrors.titleFa = "عنوان فارسی محتوا الزامی است.";
    }
    if (!data.summaryFa.trim()) {
      newErrors.summaryFa = "خلاصه فارسی محتوا الزامی است.";
    }
    if (!data.descriptionFa.trim()) {
      newErrors.descriptionFa = "شرح و متن اصلی محتوا (فارسی) الزامی است.";
    }
    if (!data.startDateTime) {
      newErrors.startDateTime = "تاریخ و ساعت شروع فعال‌سازی الزامی است.";
    }
    if (data.startDateTime && data.endDateTime && data.endDateTime <= data.startDateTime) {
      newErrors.endDateTime = "تاریخ پایان باید بعد از تاریخ شروع باشد.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // تهیه شیء خروجی جهت ارسال
  const payload = useMemo(
    () => ({
      category: data.category,
      titleFa: data.titleFa.trim(),
      titleEn: data.titleEn.trim(),
      summaryFa: data.summaryFa.trim(),
      summaryEn: data.summaryEn.trim(),
      descriptionFa: data.descriptionFa.trim(),
      descriptionEn: data.descriptionEn.trim(),
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      keywordsFa,
      keywordsEn,
      imageFile,
    }),
    [data, keywordsFa, keywordsEn, imageFile]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (typeof onSubmit === "function") {
      await onSubmit(payload);
    } else {
      console.log("Content Submitted Payload:", payload);
    }
  };

  const handleClear = () => {
    setData({
      category: "",
      titleFa: "",
      titleEn: "",
      summaryFa: "",
      summaryEn: "",
      descriptionFa: "",
      descriptionEn: "",
      startDateTime: "",
      endDateTime: "",
    });
    setKeywordsFa([]);
    setKeywordsEn([]);
    setTempKeywordFa("");
    setTempKeywordEn("");
    handleRemoveImage();
    setErrors({});
  };

  const getCategoryLabel = (categoryValue, lang) => {
    const item = CONTENT_CATEGORIES.find((c) => c.value === categoryValue);
    if (!item) return "";
    return lang === "fa" ? item.labelFa : item.labelEn;
  };

  const renderLangSwitcher = (fieldKey) => (
    <div className="lang-switcher">
      <button
        type="button"
        className={`lang-btn ${activeLang[fieldKey] === "fa" ? "active" : ""}`}
        onClick={() => handleLangToggle(fieldKey, "fa")}
      >
        فارسی
      </button>
      <button
        type="button"
        className={`lang-btn ${activeLang[fieldKey] === "en" ? "active" : ""}`}
        onClick={() => handleLangToggle(fieldKey, "en")}
      >
        EN
      </button>
    </div>
  );

  return (
    <div className="content-page" dir="rtl">
      <div className="content-card">
        {/* هدر */}
        <header className="content-header">
          <div>
            <h1 className="content-title">ایجاد و انتشار محتوای جدید</h1>
            <p className="content-subtitle">
              انتخاب طبقه‌بندی موضوعی، متن دوزبانه، کلمات کلیدی، زمان‌بندی انتشار و تصویر شاخص
            </p>
          </div>
          <span className="content-badge">مدیریت محتوا</span>
        </header>

        {/* بدنه فرم */}
        <form onSubmit={handleSubmit} className="content-form" noValidate>
          {/* طبقه‌بندی محتوا */}
          <div className="form-group">
            <label className="field-label">
              <span className="required-star">*</span>
              طبقه‌بندی موضوعی محتوا
            </label>
            <select
              name="category"
              value={data.category}
              onChange={handleChange}
              className={`form-select ${errors.category ? "input-has-error" : ""}`}
            >
              <option value="">-- لطفاً دسته‌بندی مورد نظر را انتخاب نمایید --</option>
              {CONTENT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.labelFa} | {cat.labelEn}
                </option>
              ))}
            </select>
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>

          {/* عنوان محتوا */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                <span className="required-star">*</span>
                عنوان محتوا {activeLang.title === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("title")}
            </div>

            {activeLang.title === "fa" ? (
              <>
                <input
                  type="text"
                  name="titleFa"
                  dir="rtl"
                  value={data.titleFa}
                  onChange={handleChange}
                  placeholder="مثال: دستورالعمل اجرایی ترخیص تجهیزات صنعتی از گمرک"
                  className={`form-input ${errors.titleFa ? "input-has-error" : ""}`}
                />
                {errors.titleFa && <div className="error-message">{errors.titleFa}</div>}
              </>
            ) : (
              <input
                type="text"
                name="titleEn"
                dir="ltr"
                value={data.titleEn}
                onChange={handleChange}
                placeholder="e.g. Operational Guidelines for Industrial Equipment Clearance"
                className="form-input"
              />
            )}
          </div>

          {/* خلاصه محتوا */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                <span className="required-star">*</span>
                خلاصه محتوا {activeLang.summary === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("summary")}
            </div>

            {activeLang.summary === "fa" ? (
              <>
                <textarea
                  name="summaryFa"
                  dir="rtl"
                  rows={2}
                  value={data.summaryFa}
                  onChange={handleChange}
                  placeholder="چکیده کوتاه محتوا جهت نمایش در لیست‌ها و کارت‌ها..."
                  className={`form-textarea ${errors.summaryFa ? "input-has-error" : ""}`}
                />
                {errors.summaryFa && <div className="error-message">{errors.summaryFa}</div>}
              </>
            ) : (
              <textarea
                name="summaryEn"
                dir="ltr"
                rows={2}
                value={data.summaryEn}
                onChange={handleChange}
                placeholder="Short summary for card previews..."
                className="form-textarea"
              />
            )}
          </div>

          {/* متن اصلی و شرح */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                <span className="required-star">*</span>
                شرح و متن کامل {activeLang.description === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("description")}
            </div>

            {activeLang.description === "fa" ? (
              <>
                <textarea
                  name="descriptionFa"
                  dir="rtl"
                  rows={6}
                  value={data.descriptionFa}
                  onChange={handleChange}
                  placeholder="متن کامل محتوا به زبان فارسی..."
                  className={`form-textarea ${errors.descriptionFa ? "input-has-error" : ""}`}
                />
                {errors.descriptionFa && (
                  <div className="error-message">{errors.descriptionFa}</div>
                )}
              </>
            ) : (
              <textarea
                name="descriptionEn"
                dir="ltr"
                rows={6}
                value={data.descriptionEn}
                onChange={handleChange}
                placeholder="Full content description in English..."
                className="form-textarea"
              />
            )}
          </div>

          {/* کلمات کلیدی */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                کلمات کلیدی / برچسب‌ها {activeLang.keywords === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("keywords")}
            </div>

            {activeLang.keywords === "fa" ? (
              <div>
                <div className="keywords-input-wrapper">
                  <input
                    type="text"
                    dir="rtl"
                    value={tempKeywordFa}
                    onChange={(e) => setTempKeywordFa(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddKeyword("fa"))
                    }
                    placeholder="کلمه کلیدی را تایپ کرده و افزودن را بزنید..."
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddKeyword("fa")}
                    className="btn-add-tag"
                  >
                    افزودن
                  </button>
                </div>
                <div className="tags-container">
                  {keywordsFa.map((tag) => (
                    <span key={tag} className="tag-badge">
                      #{tag}
                      <span
                        className="tag-remove"
                        onClick={() => handleRemoveKeyword("fa", tag)}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="keywords-input-wrapper">
                  <input
                    type="text"
                    dir="ltr"
                    value={tempKeywordEn}
                    onChange={(e) => setTempKeywordEn(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddKeyword("en"))
                    }
                    placeholder="Type keyword and press add..."
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddKeyword("en")}
                    className="btn-add-tag"
                  >
                    Add
                  </button>
                </div>
                <div className="tags-container">
                  {keywordsEn.map((tag) => (
                    <span key={tag} className="tag-badge">
                      #{tag}
                      <span
                        className="tag-remove"
                        onClick={() => handleRemoveKeyword("en", tag)}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* تنظیم روز و ساعت شروع و پایان فعال‌سازی */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="field-label">
                <span className="required-star">*</span>
                تاریخ و ساعت شروع فعال شدن
              </label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={data.startDateTime}
                onChange={handleChange}
                className={`form-input ${errors.startDateTime ? "input-has-error" : ""}`}
              />
              {errors.startDateTime && (
                <div className="error-message">{errors.startDateTime}</div>
              )}
            </div>

            <div className="form-group">
              <label className="field-label">تاریخ و ساعت پایان انقضا (اختیاری)</label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={data.endDateTime}
                onChange={handleChange}
                className={`form-input ${errors.endDateTime ? "input-has-error" : ""}`}
              />
              {errors.endDateTime && (
                <div className="error-message">{errors.endDateTime}</div>
              )}
            </div>
          </div>

          {/* آپلود تصویر شاخص */}
          <div className="form-group">
            <label className="field-label">تصویر شاخص محتوا</label>
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            {!imagePreviewUrl ? (
              <div
                className="image-upload-box"
                onClick={() => imageInputRef.current && imageInputRef.current.click()}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>🖼️</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  برای انتخاب یا آپلود تصویر شاخص کلیک کنید
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۵ مگابایت)
                </div>
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={imagePreviewUrl} alt="Preview" className="image-preview-img" />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={handleRemoveImage}
                  title="حذف تصویر"
                >
                  ✕
                </button>
              </div>
            )}
            {errors.image && <div className="error-message">{errors.image}</div>}
          </div>

          {/* اکشن‌ها */}
          <div className="form-actions">
            <button type="button" onClick={handleClear} className="btn-clear">
              پاک‌سازی
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-preview"
            >
              پیش‌نمایش
            </button>
            <button type="submit" className="btn-submit">
              انتشار و ثبت محتوا
            </button>
          </div>
        </form>
      </div>

      {/* مودال پیش‌نمایش زنده */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>پیش‌نمایش محتوا</h3>
              <div className="lang-switcher">
                <button
                  type="button"
                  className={`lang-btn ${previewLang === "fa" ? "active" : ""}`}
                  onClick={() => setPreviewLang("fa")}
                >
                  نمای فارسی
                </button>
                <button
                  type="button"
                  className={`lang-btn ${previewLang === "en" ? "active" : ""}`}
                  onClick={() => setPreviewLang("en")}
                >
                  English View
                </button>
              </div>
            </div>

            <div className="preview-modal-body" dir={previewLang === "fa" ? "rtl" : "ltr"}>
              {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="Banner" className="preview-img-banner" />
              )}

              {/* نوار مشخصات دسته‌بندی و زمان انتشار */}
              <div className="preview-meta-row">
                {data.category && (
                  <span className="preview-category-badge">
                    🏷️ {getCategoryLabel(data.category, previewLang)}
                  </span>
                )}

                <div className="preview-schedule-badge">
                  🕒 {previewLang === "fa" ? "زمان انتشار:" : "Publish Time:"}{" "}
                  {data.startDateTime ? data.startDateTime.replace("T", " ") : "---"}
                </div>
              </div>

              <h1 className="preview-main-title">
                {previewLang === "fa"
                  ? data.titleFa || "(بدون عنوان)"
                  : data.titleEn || "(Untitled Content)"}
              </h1>

              {/* خلاصه */}
              {(data.summaryFa || data.summaryEn) && (
                <div
                  className={`preview-summary-box ${previewLang === "en" ? "ltr" : ""}`}
                >
                  {previewLang === "fa" ? data.summaryFa : data.summaryEn}
                </div>
              )}

              {/* متن کامل */}
              <div className="preview-content-body">
                {previewLang === "fa"
                  ? data.descriptionFa || "متنی وارد نشده است."
                  : data.descriptionEn || "No English text provided."}
              </div>

              {/* کلمات کلیدی */}
              <div className="tags-container" style={{ marginTop: 24 }}>
                {(previewLang === "fa" ? keywordsFa : keywordsEn).map((tag) => (
                  <span key={tag} className="tag-badge">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="preview-modal-footer">
              <button
                type="button"
                className="btn-clear"
                onClick={() => setShowPreview(false)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAddForm;
