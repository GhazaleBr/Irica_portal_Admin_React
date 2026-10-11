import React, { useMemo, useRef, useState } from "react";
import "./DirectiveAddForm.css";

const MAX_FILE_SIZE_MB = 20;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "zip", "rar", "jpg", "jpeg", "png"];

const DirectiveAddForm = ({ onSubmit }) => {
  const fileInputRef = useRef(null);

  const [data, setData] = useState({
    titleFa: "",
    titleEn: "",
    directiveNo: "",
    approvalDate: "",
    summaryFa: "",
    summaryEn: "",
    bodyFa: "",
    bodyEn: "",
    keywordsFa: [],
    keywordsEn: [],
    attachments: [], // [{ id, file, name, size, ext, titleFa, titleEn }]
  });

  const [keywordInput, setKeywordInput] = useState({ fa: "", en: "" });
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState("fa");
  const [activeLang, setActiveLang] = useState({
    title: "fa",
    summary: "fa",
    body: "fa",
    keywords: "fa",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLangToggle = (fieldKey, lang) => {
    setActiveLang((prev) => ({ ...prev, [fieldKey]: lang }));
  };

  /* --- مدیریت کلمات کلیدی --- */
  const normalizeKeyword = (text) =>
    text
      .replace(/\s+/g, " ")
      .replace(/[،,]+/g, "،")
      .trim();

  const addKeyword = (lang) => {
    const raw = keywordInput[lang];
    const value = normalizeKeyword(raw);
    if (!value) return;

    const key = lang === "fa" ? "keywordsFa" : "keywordsEn";
    const parts = value
      .split(/[,،]/g)
      .map((item) => normalizeKeyword(item))
      .filter(Boolean);

    setData((prev) => {
      const existing = new Set(prev[key].map((k) => k.toLowerCase()));
      const merged = [...prev[key]];

      parts.forEach((token) => {
        if (!existing.has(token.toLowerCase())) {
          merged.push(token);
        }
      });

      return { ...prev, [key]: merged };
    });

    setKeywordInput((prev) => ({ ...prev, [lang]: "" }));
  };

  const removeKeyword = (lang, indexToRemove) => {
    const key = lang === "fa" ? "keywordsFa" : "keywordsEn";
    setData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleKeywordKeyDown = (lang, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(lang);
    }
  };

  /* --- مدیریت فایل‌های پیوست --- */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const handleFilesSelected = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    let fileError = "";
    const validNewItems = [];

    files.forEach((file) => {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const sizeMb = file.size / (1024 * 1024);

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        fileError = `فرمت فایل "${file.name}" مجاز نیست.`;
        return;
      }

      if (sizeMb > MAX_FILE_SIZE_MB) {
        fileError = `حجم فایل "${file.name}" بیش از ${MAX_FILE_SIZE_MB} مگابایت است.`;
        return;
      }

      validNewItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        ext,
        titleFa: "",
        titleEn: "",
      });
    });

    setErrors((prev) => ({ ...prev, attachments: fileError }));

    if (validNewItems.length > 0) {
      setData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...validNewItems],
      }));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAttachmentCaptionChange = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      attachments: prev.attachments.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeAttachment = (id) => {
    setData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((item) => item.id !== id),
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  /* --- اعتبارسنجی و ساخت داده نهایی --- */
  const validate = () => {
    const newErrors = {};
    if (!data.titleFa.trim()) newErrors.titleFa = "عنوان فارسی بخشنامه الزامی است.";
    if (!data.directiveNo.trim()) newErrors.directiveNo = "شماره بخشنامه الزامی است.";
    if (!data.approvalDate.trim()) newErrors.approvalDate = "تاریخ تصویب الزامی است.";
    if (!data.summaryFa.trim()) newErrors.summaryFa = "خلاصه فارسی الزامی است.";
    if (!data.bodyFa.trim()) newErrors.bodyFa = "متن فارسی بخشنامه الزامی است.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const payload = useMemo(
    () => ({
      titleFa: data.titleFa.trim(),
      titleEn: data.titleEn.trim(),
      directiveNo: data.directiveNo.trim(),
      approvalDate: data.approvalDate,
      summaryFa: data.summaryFa.trim(),
      summaryEn: data.summaryEn.trim(),
      bodyFa: data.bodyFa.trim(),
      bodyEn: data.bodyEn.trim(),
      keywordsFa: data.keywordsFa,
      keywordsEn: data.keywordsEn,
      attachments: data.attachments.map((att) => ({
        file: att.file,
        name: att.name,
        size: att.size,
        titleFa: att.titleFa.trim() || att.name,
        titleEn: att.titleEn.trim(),
      })),
    }),
    [data]
  );

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("titleFa", payload.titleFa);
    formData.append("titleEn", payload.titleEn);
    formData.append("directiveNo", payload.directiveNo);
    formData.append("approvalDate", payload.approvalDate);
    formData.append("summaryFa", payload.summaryFa);
    formData.append("summaryEn", payload.summaryEn);
    formData.append("bodyFa", payload.bodyFa);
    formData.append("bodyEn", payload.bodyEn);
    formData.append("keywordsFa", JSON.stringify(payload.keywordsFa));
    formData.append("keywordsEn", JSON.stringify(payload.keywordsEn));

    payload.attachments.forEach((att, idx) => {
      formData.append("files", att.file);
      formData.append(
        `attachmentsMeta[${idx}]`,
        JSON.stringify({
          name: att.name,
          titleFa: att.titleFa,
          titleEn: att.titleEn,
        })
      );
    });

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = buildFormData();

    if (typeof onSubmit === "function") {
      await onSubmit(payload, formData);
    } else {
      console.log("Directive Payload Submitted:", payload);
    }
  };

  const handleClear = () => {
    setData({
      titleFa: "",
      titleEn: "",
      directiveNo: "",
      approvalDate: "",
      summaryFa: "",
      summaryEn: "",
      bodyFa: "",
      bodyEn: "",
      keywordsFa: [],
      keywordsEn: [],
      attachments: [],
    });
    setKeywordInput({ fa: "", en: "" });
    setErrors({});
    setActiveLang({ title: "fa", summary: "fa", body: "fa", keywords: "fa" });
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="directive-page" dir="rtl">
      <div className="directive-card">
        {/* Header */}
        <header className="directive-header">
          <div>
            <h1 className="directive-title">افزودن بخشنامه جدید</h1>
            <p className="directive-subtitle">
              ورود اطلاعات دوزبانه، تاریخ، شماره و پیوست‌های مرتبط با بخشنامه
            </p>
          </div>
          <span className="directive-badge">بخشنامه‌ها</span>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="directive-form" noValidate>
          {/* شماره بخشنامه و تاریخ تصویب */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="field-label">شماره بخشنامه</label>
              <input
                type="text"
                name="directiveNo"
                value={data.directiveNo}
                onChange={handleChange}
                placeholder="مثال: ۱۴۰۳/۱۸۴۷۹"
                className={`form-input ${errors.directiveNo ? "input-has-error" : ""}`}
              />
              {errors.directiveNo && (
                <div className="error-message">{errors.directiveNo}</div>
              )}
            </div>

            <div className="form-group">
              <label className="field-label">تاریخ تصویب</label>
              <input
                type="date"
                name="approvalDate"
                value={data.approvalDate}
                onChange={handleChange}
                className={`form-input ${errors.approvalDate ? "input-has-error" : ""}`}
              />
              {errors.approvalDate && (
                <div className="error-message">{errors.approvalDate}</div>
              )}
            </div>
          </div>

          {/* عنوان بخشنامه */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                عنوان بخشنامه {activeLang.title === "fa" ? "(فارسی)" : "(English)"}
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
                  placeholder="عنوان کامل بخشنامه به فارسی..."
                  className={`form-input ${errors.titleFa ? "input-has-error" : ""}`}
                />
                {errors.titleFa && (
                  <div className="error-message">{errors.titleFa}</div>
                )}
              </>
            ) : (
              <input
                type="text"
                name="titleEn"
                dir="ltr"
                value={data.titleEn}
                onChange={handleChange}
                placeholder="Directive title in English..."
                className="form-input"
              />
            )}
          </div>

          {/* خلاصه بخشنامه */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                خلاصه بخشنامه {activeLang.summary === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("summary")}
            </div>

            {activeLang.summary === "fa" ? (
              <>
                <textarea
                  name="summaryFa"
                  dir="rtl"
                  rows={3}
                  value={data.summaryFa}
                  onChange={handleChange}
                  placeholder="خلاصه اجرایی یا موضوع بخشنامه به زبان فارسی..."
                  className={`form-textarea ${errors.summaryFa ? "input-has-error" : ""}`}
                />
                {errors.summaryFa && (
                  <div className="error-message">{errors.summaryFa}</div>
                )}
              </>
            ) : (
              <textarea
                name="summaryEn"
                dir="ltr"
                rows={3}
                value={data.summaryEn}
                onChange={handleChange}
                placeholder="Brief summary in English..."
                className="form-textarea"
              />
            )}
          </div>

          {/* متن کامل بخشنامه */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                متن کامل بخشنامه {activeLang.body === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("body")}
            </div>

            {activeLang.body === "fa" ? (
              <>
                <textarea
                  name="bodyFa"
                  dir="rtl"
                  rows={8}
                  value={data.bodyFa}
                  onChange={handleChange}
                  placeholder="مفاد و متن کامل بخشنامه فارسی..."
                  className={`form-textarea ${errors.bodyFa ? "input-has-error" : ""}`}
                />
                {errors.bodyFa && (
                  <div className="error-message">{errors.bodyFa}</div>
                )}
              </>
            ) : (
              <textarea
                name="bodyEn"
                dir="ltr"
                rows={8}
                value={data.bodyEn}
                onChange={handleChange}
                placeholder="Full text of the directive in English..."
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
              <>
                <div className="keyword-input-wrapper">
                  <input
                    type="text"
                    dir="rtl"
                    value={keywordInput.fa}
                    onChange={(e) =>
                      setKeywordInput((prev) => ({ ...prev, fa: e.target.value }))
                    }
                    onKeyDown={(e) => handleKeywordKeyDown("fa", e)}
                    placeholder="مثال: ترخیص، اظهارنامه، EPL (Enter برای ثبت)"
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => addKeyword("fa")}
                    className="btn-add-keyword"
                  >
                    افزودن
                  </button>
                </div>

                <div className="chips-container">
                  {data.keywordsFa.map((item, index) => (
                    <span key={`fa-${index}`} className="keyword-chip">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeKeyword("fa", index)}
                        className="chip-remove-btn"
                        title="حذف کلمه کلیدی"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="keyword-input-wrapper">
                  <input
                    type="text"
                    dir="ltr"
                    value={keywordInput.en}
                    onChange={(e) =>
                      setKeywordInput((prev) => ({ ...prev, en: e.target.value }))
                    }
                    onKeyDown={(e) => handleKeywordKeyDown("en", e)}
                    placeholder="e.g. Clearance, Customs, Export (Press Enter)"
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => addKeyword("en")}
                    className="btn-add-keyword"
                  >
                    Add
                  </button>
                </div>

                <div className="chips-container">
                  {data.keywordsEn.map((item, index) => (
                    <span key={`en-${index}`} className="keyword-chip">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeKeyword("en", index)}
                        className="chip-remove-btn"
                        title="Remove keyword"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* پیوست فایل‌ها (Attachments) */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">فایل‌های پیوست (اسکن بخشنامه، ضمائم، فرمت PDF/Word)</label>
            </div>

            <div
              className={`file-dropzone ${isDragging ? "dragging" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png"
                className="file-dropzone-input"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <div className="dropzone-title">
                فایل‌ها را به اینجا بکشید یا برای <span>انتخاب فایل</span> کلیک نمایید
              </div>
              <div className="dropzone-hint">
                فرمت‌های مجاز: PDF, Word, Excel, ZIP, RAR, JPG, PNG (حداکثر {MAX_FILE_SIZE_MB} مگابایت)
              </div>
            </div>

            {errors.attachments && (
              <div className="error-message">{errors.attachments}</div>
            )}

            {data.attachments.length > 0 && (
              <div className="attachments-list">
                {data.attachments.map((att) => (
                  <div key={att.id} className="attachment-item">
                    <div className="attachment-meta">
                      <span className="attachment-ext">{att.ext}</span>
                      <div className="attachment-info">
                        <div className="attachment-name" title={att.name}>
                          {att.name}
                        </div>
                        <div className="attachment-size">
                          {formatFileSize(att.size)}
                        </div>
                      </div>
                    </div>

                    <div className="attachment-captions">
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="عنوان پیوست (فارسی)..."
                        value={att.titleFa}
                        onChange={(e) =>
                          handleAttachmentCaptionChange(att.id, "titleFa", e.target.value)
                        }
                        className="attachment-caption-input"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="Attachment title (EN)..."
                        value={att.titleEn}
                        onChange={(e) =>
                          handleAttachmentCaptionChange(att.id, "titleEn", e.target.value)
                        }
                        className="attachment-caption-input"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="btn-remove-attachment"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* اکشن‌ها */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClear}
              className="btn-clear"
            >
              پاک‌سازی
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-preview"
            >
              پیش‌نمایش
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              ثبت نهایی بخشنامه
            </button>
          </div>
        </form>
      </div>

      {/* مودال پیش‌نمایش (Preview Modal) */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3>پیش‌نمایش بخشنامه</h3>
              <div className="preview-header-controls">
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
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setShowPreview(false)}
                >
                  &times;
                </button>
              </div>
            </div>

            <div
              className="preview-modal-body"
              dir={previewLang === "fa" ? "rtl" : "ltr"}
            >
              {/* متادیتای شماره و تاریخ */}
              <div className="preview-meta-bar">
                <div className="preview-meta-item">
                  <strong>{previewLang === "fa" ? "شماره بخشنامه:" : "Directive No:"}</strong>
                  <span>{data.directiveNo || "---"}</span>
                </div>
                <div className="preview-meta-item">
                  <strong>{previewLang === "fa" ? "تاریخ تصویب:" : "Approval Date:"}</strong>
                  <span>{data.approvalDate || "---"}</span>
                </div>
              </div>

              {/* عنوان */}
              <h2 className="preview-main-title">
                {previewLang === "fa"
                  ? data.titleFa || <span className="preview-empty-notice">(عنوان فارسی وارد نشده)</span>
                  : data.titleEn || <span className="preview-empty-notice">(No English title provided)</span>}
              </h2>

              {/* خلاصه */}
              <div className="preview-section-title">
                {previewLang === "fa" ? "خلاصه بخشنامه" : "Executive Summary"}
              </div>
              <div className={`preview-summary-box ${previewLang === "en" ? "ltr" : ""}`}>
                {previewLang === "fa"
                  ? data.summaryFa || "خلاصه‌ای ثبت نشده است."
                  : data.summaryEn || "No summary provided."}
              </div>

              {/* متن کامل */}
              <div className="preview-section-title">
                {previewLang === "fa" ? "متن کامل ابلاغیه" : "Full Text"}
              </div>
              <div className="preview-body-content">
                {previewLang === "fa"
                  ? data.bodyFa || "متن بخشنامه خالی است."
                  : data.bodyEn || "No English text provided."}
              </div>

              {/* برچسب‌ها / کلمات کلیدی */}
              <div className="preview-section-title">
                {previewLang === "fa" ? "کلمات کلیدی" : "Keywords"}
              </div>
              <div className="preview-keywords-list">
                {(previewLang === "fa" ? data.keywordsFa : data.keywordsEn).length > 0 ? (
                  (previewLang === "fa" ? data.keywordsFa : data.keywordsEn).map((kw, i) => (
                    <span key={i} className="keyword-chip">
                      #{kw}
                    </span>
                  ))
                ) : (
                  <span className="preview-empty-notice">
                    {previewLang === "fa" ? "کلمه کلیدی ثبت نشده است." : "No keywords added."}
                  </span>
                )}
              </div>

              {/* لیست پیوست‌ها */}
              <div className="preview-section-title">
                {previewLang === "fa"
                  ? `فایل‌های ضمیمه (${data.attachments.length})`
                  : `Attachments (${data.attachments.length})`}
              </div>
              {data.attachments.length > 0 ? (
                <div className="preview-attachments-list">
                  {data.attachments.map((att) => (
                    <div key={att.id} className="preview-attachment-card">
                      <span className="attachment-ext">{att.ext}</span>
                      <div className="attachment-info">
                        <div className="attachment-name">
                          {previewLang === "fa"
                            ? att.titleFa || att.name
                            : att.titleEn || att.name}
                        </div>
                        <div className="attachment-size">{formatFileSize(att.size)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="preview-empty-notice">
                  {previewLang === "fa" ? "هیچ فایلی ضمیمه نشده است." : "No attached files."}
                </span>
              )}
            </div>

            <div className="preview-modal-footer">
              <button
                type="button"
                className="btn-clear"
                onClick={() => setShowPreview(false)}
              >
                بستن پیش‌نمایش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectiveAddForm;
