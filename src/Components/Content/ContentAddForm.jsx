import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { contentService } from "../../services/ContentService";
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

const ContentAddForm = ({ onSuccess }) => {
  const [data, setData] = useState({
    category: "",
    title: "",
    summaryFa: "",
    summaryEn: "",
    bodyFa: "",
    bodyEn: "",
    hasSchedule: true,
    scheduleStartDate: "",
    scheduleStartTime: "",
    scheduleEndDate: "",
    scheduleEndTime: "",
    entityStatusId: 0,
    navigationShow: true,
    lockCopy: true,
    provinceId: 0,
    imageFaId: 0,
    imageEnId: 0,
  });

  const [keywordsFa, setKeywordsFa] = useState([]);
  const [keywordsEn, setKeywordsEn] = useState([]);
  const [tempKeywordFa, setTempKeywordFa] = useState("");
  const [tempKeywordEn, setTempKeywordEn] = useState("");

  // فایل‌های تصویر
  const [imageFaFile, setImageFaFile] = useState(null);
  const [imageEnFile, setImageEnFile] = useState(null);
  const [imageFaPreview, setImageFaPreview] = useState("");
  const [imageEnPreview, setImageEnPreview] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState("fa");

  // زبان فعال برای فیلدهای دوزبانه
  const [activeLang, setActiveLang] = useState({
    summary: "fa",
    body: "fa",
    keywords: "fa",
    image: "fa",
  });

  const imageFaInputRef = useRef(null);
  const imageEnInputRef = useRef(null);

  const handleLangToggle = (fieldKey, lang) => {
    setActiveLang((prev) => ({ ...prev, [fieldKey]: lang }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // مدیریت آپلود تصاویر
  const handleImageChange = (e, lang) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, [lang === "fa" ? "imageFa" : "imageEn"]: "لطفاً فایل تصویری معتبر انتخاب کنید." }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [lang === "fa" ? "imageFa" : "imageEn"]: "حجم تصویر حداکثر ۵ مگابایت است." }));
        return;
      }

      if (lang === "fa") {
        setImageFaFile(file);
        setImageFaPreview(URL.createObjectURL(file));
      } else {
        setImageEnFile(file);
        setImageEnPreview(URL.createObjectURL(file));
      }
      setErrors((prev) => ({ ...prev, [lang === "fa" ? "imageFa" : "imageEn"]: "" }));
    }
  };

  const handleRemoveImage = (lang) => {
    if (lang === "fa") {
      setImageFaFile(null);
      if (imageFaPreview) URL.revokeObjectURL(imageFaPreview);
      setImageFaPreview("");
      if (imageFaInputRef.current) imageFaInputRef.current.value = "";
    } else {
      setImageEnFile(null);
      if (imageEnPreview) URL.revokeObjectURL(imageEnPreview);
      setImageEnPreview("");
      if (imageEnInputRef.current) imageEnInputRef.current.value = "";
    }
  };

  // کلمات کلیدی
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
    if (!data.title.trim()) {
      newErrors.title = "عنوان محتوا الزامی است.";
    }
    if (!data.summaryFa.trim()) {
      newErrors.summaryFa = "خلاصه فارسی محتوا الزامی است.";
    }
    if (!data.bodyFa.trim()) {
      newErrors.bodyFa = "متن اصلی محتوا (فارسی) الزامی است.";
    }
    if (data.hasSchedule && !data.scheduleStartDate) {
      newErrors.scheduleStartDate = "تاریخ شروع زمان‌بندی الزامی است.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClear = () => {
    setData({
      category: "",
      title: "",
      summaryFa: "",
      summaryEn: "",
      bodyFa: "",
      bodyEn: "",
      hasSchedule: true,
      scheduleStartDate: "",
      scheduleStartTime: "",
      scheduleEndDate: "",
      scheduleEndTime: "",
      entityStatusId: 0,
      navigationShow: true,
      lockCopy: true,
      provinceId: 0,
      imageFaId: 0,
      imageEnId: 0,
    });
    setKeywordsFa([]);
    setKeywordsEn([]);
    setTempKeywordFa("");
    setTempKeywordEn("");
    handleRemoveImage("fa");
    handleRemoveImage("en");
    setErrors({});
  };

  // ارسال درخواست با FormData جهت پشتیبانی از فایل و مقادیر
  const executeSubmit = async () => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("category", data.category);
      formData.append("title", data.title.trim());
      formData.append("summaryFa", data.summaryFa.trim());
      formData.append("summaryEn", data.summaryEn.trim());
      formData.append("bodyFa", data.bodyFa.trim());
      formData.append("bodyEn", data.bodyEn.trim());
      formData.append("keyWordsFa", keywordsFa.join(","));
      formData.append("keyWordsEn", keywordsEn.join(","));
      formData.append("hasSchedule", data.hasSchedule);
      formData.append("scheduleStartDate", data.scheduleStartDate);
      formData.append("scheduleStartTime", data.scheduleStartTime);
      formData.append("scheduleEndDate", data.scheduleEndDate);
      formData.append("scheduleEndTime", data.scheduleEndTime);
      formData.append("entityStatusId", data.entityStatusId);
      formData.append("navigationShow", data.navigationShow);
      formData.append("lockCopy", data.lockCopy);
      formData.append("provinceId", data.provinceId);
      formData.append("deactivateAt", new Date().toISOString());

      if (imageFaFile) formData.append("imageFa", imageFaFile);
      if (imageEnFile) formData.append("imageEn", imageEnFile);

      const result = await contentService.manageContents(formData);

      toast.success("محتوا با موفقیت ثبت و منتشر گردید.");

      if (typeof onSuccess === "function") {
        onSuccess(result);
      }

      handleClear();
    } catch (error) {
      console.error("Content Creation Error:", error);
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "خطا در ایجاد و ثبت محتوا. لطفاً مجدداً تلاش فرمایید.";
      toast.error(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // تأییدیه با react-toastify
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    toast.warn(
      ({ closeToast }) => (
        <div style={{ fontFamily: "inherit", direction: "rtl", padding: "4px 0" }}>
          <p style={{ margin: "0 0 10px 0", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
            آیا از ثبت و انتشار این محتوا اطمینان دارید؟
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                closeToast();
                executeSubmit();
              }}
              style={{
                padding: "5px 14px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              بله، ثبت شود
            </button>
            <button
              type="button"
              onClick={closeToast}
              style={{
                padding: "5px 12px",
                background: "#e2e8f0",
                color: "#475569",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              انصراف
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
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
        <header className="content-header">
          <div>
            <h1 className="content-title">ایجاد و انتشار محتوای جدید</h1>
            <p className="content-subtitle">
              ثبت اطلاعات، متن دوزبانه، برچسب‌ها، زمان‌بندی و آپلود فایل‌های تصویر شاخص
            </p>
          </div>
          <span className="content-badge">مدیریت محتوا</span>
        </header>

        <form onSubmit={handleSubmit} className="content-form" noValidate>
          {/* طبقه‌بندی موضوعی */}
          <div className="form-group">
            <label className="field-label">
              <span className="required-star">*</span>
              طبقه‌بندی موضوعی محتوا
            </label>
            <select
              name="category"
              value={data.category}
              onChange={handleChange}
              disabled={isSubmitting}
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

          {/* عنوان */}
          <div className="form-group">
            <label className="field-label">
              <span className="required-star">*</span>
              عنوان محتوا (Title)
            </label>
            <input
              type="text"
              name="title"
              dir="rtl"
              value={data.title}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="مثال: دستورالعمل اجرایی ترخیص تجهیزات صنعتی از گمرک"
              className={`form-input ${errors.title ? "input-has-error" : ""}`}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          {/* خلاصه */}
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
                  disabled={isSubmitting}
                  placeholder="چکیده کوتاه محتوا..."
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
                disabled={isSubmitting}
                placeholder="Short summary in English..."
                className="form-textarea"
              />
            )}
          </div>

          {/* متن اصلی (Body) */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                <span className="required-star">*</span>
                متن کامل {activeLang.body === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("body")}
            </div>

            {activeLang.body === "fa" ? (
              <>
                <textarea
                  name="bodyFa"
                  dir="rtl"
                  rows={6}
                  value={data.bodyFa}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="متن کامل محتوا به زبان فارسی..."
                  className={`form-textarea ${errors.bodyFa ? "input-has-error" : ""}`}
                />
                {errors.bodyFa && <div className="error-message">{errors.bodyFa}</div>}
              </>
            ) : (
              <textarea
                name="bodyEn"
                dir="ltr"
                rows={6}
                value={data.bodyEn}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Full body text in English..."
                className="form-textarea"
              />
            )}
          </div>

          {/* کلمات کلیدی */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                کلمات کلیدی {activeLang.keywords === "fa" ? "(فارسی)" : "(English)"}
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
                    disabled={isSubmitting}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddKeyword("fa"))
                    }
                    placeholder="کلمه کلیدی فارسی..."
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddKeyword("fa")}
                    disabled={isSubmitting}
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
                        onClick={() => !isSubmitting && handleRemoveKeyword("fa", tag)}
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
                    disabled={isSubmitting}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddKeyword("en"))
                    }
                    placeholder="English keyword..."
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddKeyword("en")}
                    disabled={isSubmitting}
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
                        onClick={() => !isSubmitting && handleRemoveKeyword("en", tag)}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* آپلود تصویر شاخص دوزبانه */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">تصویر شاخص {activeLang.image === "fa" ? "(فارسی)" : "(English)"}</label>
              {renderLangSwitcher("image")}
            </div>

            {activeLang.image === "fa" ? (
              <>
                <input
                  type="file"
                  ref={imageFaInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageChange(e, "fa")}
                  disabled={isSubmitting}
                />
                {!imageFaPreview ? (
                  <div
                    className="image-upload-box"
                    onClick={() => !isSubmitting && imageFaInputRef.current?.click()}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🖼️</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>کلیک جهت آپلود تصویر شاخص فارسی</div>
                  </div>
                ) : (
                  <div className="image-preview-container">
                    <img src={imageFaPreview} alt="FA Preview" className="image-preview-img" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => handleRemoveImage("fa")}
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <input
                  type="file"
                  ref={imageEnInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageChange(e, "en")}
                  disabled={isSubmitting}
                />
                {!imageEnPreview ? (
                  <div
                    className="image-upload-box"
                    onClick={() => !isSubmitting && imageEnInputRef.current?.click()}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🖼️</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Click to upload English banner image</div>
                  </div>
                ) : (
                  <div className="image-preview-container">
                    <img src={imageEnPreview} alt="EN Preview" className="image-preview-img" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => handleRemoveImage("en")}
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* تنظیمات زمان‌بندی */}
          <div className="form-group" style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <input
                type="checkbox"
                name="hasSchedule"
                id="hasSchedule"
                checked={data.hasSchedule}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="hasSchedule" style={{ fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                فعال‌سازی زمان‌بندی انتشار محتوا (hasSchedule)
              </label>
            </div>

            {data.hasSchedule && (
              <div className="form-grid-2" style={{ marginTop: "12px" }}>
                <div className="form-group">
                  <label className="field-label">تاریخ شروع (scheduleStartDate)</label>
                  <input
                    type="date"
                    name="scheduleStartDate"
                    value={data.scheduleStartDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`form-input ${errors.scheduleStartDate ? "input-has-error" : ""}`}
                  />
                  {errors.scheduleStartDate && (
                    <div className="error-message">{errors.scheduleStartDate}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="field-label">ساعت شروع (scheduleStartTime)</label>
                  <input
                    type="time"
                    name="scheduleStartTime"
                    value={data.scheduleStartTime}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">تاریخ پایان (scheduleEndDate)</label>
                  <input
                    type="date"
                    name="scheduleEndDate"
                    value={data.scheduleEndDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">ساعت پایان (scheduleEndTime)</label>
                  <input
                    type="time"
                    name="scheduleEndTime"
                    value={data.scheduleEndTime}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* اکشن‌ها */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClear}
              className="btn-clear"
              disabled={isSubmitting}
            >
              پاک‌سازی
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-preview"
              disabled={isSubmitting}
            >
              پیش‌نمایش
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "در حال ارسال..." : "انتشار و ثبت محتوا"}
            </button>
          </div>
        </form>
      </div>

      {/* مودال پیش‌نمایش */}
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
              {previewLang === "fa" && imageFaPreview && (
                <img src={imageFaPreview} alt="Banner FA" className="preview-img-banner" />
              )}
              {previewLang === "en" && imageEnPreview && (
                <img src={imageEnPreview} alt="Banner EN" className="preview-img-banner" />
              )}

              <div className="preview-meta-row">
                {data.category && (
                  <span className="preview-category-badge">
                    🏷️ {getCategoryLabel(data.category, previewLang)}
                  </span>
                )}
              </div>

              <h1 className="preview-main-title">{data.title || "(بدون عنوان)"}</h1>

              {(data.summaryFa || data.summaryEn) && (
                <div className={`preview-summary-box ${previewLang === "en" ? "ltr" : ""}`}>
                  {previewLang === "fa" ? data.summaryFa : data.summaryEn}
                </div>
              )}

              <div className="preview-content-body">
                {previewLang === "fa"
                  ? data.bodyFa || "متنی وارد نشده است."
                  : data.bodyEn || "No English text provided."}
              </div>

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
