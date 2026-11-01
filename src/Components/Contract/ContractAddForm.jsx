import React, { useMemo, useRef, useState } from "react";
import "./ContractAddForm.css";
import { contractService } from "../../services/ContractService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CONTRACT_STATUSES = [
  { value: "draft", labelFa: "پیش‌نویس", labelEn: "Draft" },
  { value: "active", labelFa: "جاری / فعال", labelEn: "Active" },
  { value: "pending", labelFa: "در حال بررسی", labelEn: "In Review" },
  { value: "completed", labelFa: "خاتمه‌یافته", labelEn: "Completed" },
  { value: "terminated", labelFa: "فسخ‌شده", labelEn: "Terminated" },
];

const CONTRACT_STATUS_ID_MAP = {
  draft: 1,
  active: 2,
  pending: 3,
  completed: 4,
  terminated: 5,
};

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ContractAddForm = ({ onSubmit }) => {
  const [data, setData] = useState({
    titleFa: "",
    titleEn: "",
    companyFa: "",
    companyEn: "",
    startDate: "",
    endDate: "",
    amount: "",
    descriptionFa: "",
    descriptionEn: "",
    websiteUrl: "",
    status: "active",
  });

  const [attachments, setAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState("fa");

  const fileInputRef = useRef(null);

  const [activeLang, setActiveLang] = useState({
    title: "fa",
    company: "fa",
    description: "fa",
  });

  const formatNumber = (value) => {
    if (!value) return "";
    const clean = String(value).replace(/\D/g, "");
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return (
      parseFloat((bytes / Math.pow(1024, index)).toFixed(1)) + " " + sizes[index]
    );
  };

  const handleLangToggle = (fieldKey, lang) => {
    setActiveLang((prev) => ({ ...prev, [fieldKey]: lang }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setData((prev) => ({
      ...prev,
      [name]: name === "amount" ? value.replace(/\D/g, "") : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  const processFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const validFiles = [];
    let fileError = "";

    newFiles.forEach((file) => {
      const extensionAllowed =
        /\.(rar|zip|pdf|docx?|xlsx?|png|jpe?g)$/i.test(file.name);

      if (file.size > MAX_FILE_SIZE) {
        fileError = `حجم فایل "${file.name}" بیش از ۲۰ مگابایت است.`;
        toast.error(fileError);
        return;
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type) && !extensionAllowed) {
        fileError = `فرمت فایل "${file.name}" مجاز نیست.`;
        toast.error(fileError);
        return;
      }

      validFiles.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        extension: file.name.split(".").pop(),
        titleFa: "",
        titleEn: "",
      });
    });

    setErrors((prev) => ({
      ...prev,
      attachments: fileError || "",
    }));

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileInputChange = (event) => {
    if (event.target.files?.length > 0) {
      processFiles(event.target.files);
    }
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (event.dataTransfer.files?.length > 0) {
      processFiles(event.dataTransfer.files);
    }
  };

  const handleAttachmentMetaChange = (id, field, value) => {
    setAttachments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveAttachment = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const validate = () => {
    const newErrors = {};

    if (!data.titleFa.trim()) {
      newErrors.titleFa = "موضوع / عنوان قرارداد (فارسی) الزامی است.";
    }
    if (!data.companyFa.trim()) {
      newErrors.companyFa = "نام طرف قرارداد (فارسی) الزامی است.";
    }
    if (!data.startDate) {
      newErrors.startDate = "تاریخ شروع قرارداد را انتخاب کنید.";
    }
    if (!data.endDate) {
      newErrors.endDate = "تاریخ پایان قرارداد را انتخاب کنید.";
    } else if (data.startDate && data.endDate < data.startDate) {
      newErrors.endDate = "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.";
    }
    if (!data.amount || Number(data.amount) <= 0) {
      newErrors.amount = "مبلغ قرارداد را وارد کنید.";
    }
    if (!data.descriptionFa.trim()) {
      newErrors.descriptionFa = "شرح و تعهدات قرارداد (فارسی) الزامی است.";
    }
    if (
      data.websiteUrl &&
      !/^https?:\/\/.+\..+/i.test(data.websiteUrl.trim())
    ) {
      newErrors.websiteUrl =
        "آدرس اینترنتی نامعتبر است (مثال: https://domain.ir)";
    }

    setErrors((prev) => ({
      ...prev,
      titleFa: newErrors.titleFa || "",
      companyFa: newErrors.companyFa || "",
      startDate: newErrors.startDate || "",
      endDate: newErrors.endDate || "",
      amount: newErrors.amount || "",
      descriptionFa: newErrors.descriptionFa || "",
      websiteUrl: newErrors.websiteUrl || "",
      submit: "",
    }));

    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors,
    };
  };

  const payload = useMemo(
    () => ({
      titleFa: data.titleFa.trim(),
      titleEn: data.titleEn.trim(),
      companyFa: data.companyFa.trim(),
      companyEn: data.companyEn.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      amount: data.amount ? Number(data.amount) : 0,
      descriptionFa: data.descriptionFa.trim(),
      descriptionEn: data.descriptionEn.trim(),
      websiteUrl: data.websiteUrl.trim(),
      status: data.status,
      attachments: attachments.map((attachment) => ({
        file: attachment.file,
        name: attachment.name,
        size: attachment.size,
        titleFa: attachment.titleFa.trim() || attachment.name,
        titleEn: attachment.titleEn.trim() || attachment.name,
      })),
    }),
    [data, attachments]
  );

  const buildApiPayload = () => ({
    deactivateAt: null,
    titleFa: payload.titleFa,
    titleEn: payload.titleEn,
    companyNameFa: payload.companyFa,
    companyNameEn: payload.companyEn,
    unitId: "",
    trackingCode: "",
    startDate: payload.startDate,
    endDate: payload.endDate,
    amount: payload.amount,
    bodyFa: payload.descriptionFa,
    bodyEn: payload.descriptionEn,
    siteLink: payload.websiteUrl,
    entityStatusId: 0,
    contractStatusId: CONTRACT_STATUS_ID_MAP[payload.status] ?? 0,
    provinceId: 0,
  });

  // تابع اصلی ارسال به سرور
  const executeSubmit = async () => {
    setIsSubmitting(true);
    const apiPayload = buildApiPayload();

    try {
      if (typeof onSubmit === "function") {
        await onSubmit({
          ...payload,
          apiPayload,
        });
      } else {
        await contractService.manageContracts(apiPayload);
      }

      toast.success("قرارداد با موفقیت ثبت شد.");
      handleClear();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.";

      toast.error(message);
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // رویداد کلیک روی دکمه ثبت نهایی (نمایش Toast تاییدیه)
  const handleSubmitClick = (event) => {
    event.preventDefault();

    const validationResult = validate();
    if (!validationResult.isValid) {
      toast.warn("لطفاً خطاهای فرم را برطرف کنید.");
      return;
    }

    // نمایش Toast تاییدیه سفارشی
    toast.info(
      ({ closeToast }) => (
        <div style={{ textAlign: "right", fontFamily: "inherit" }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
            آیا از ثبت نهایی این قرارداد اطمینان دارید؟
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                closeToast();
                executeSubmit();
              }}
              style={{
                background: "#28a745",
                color: "#fff",
                border: "none",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              بله، ثبت شود
            </button>
            <button
              type="button"
              onClick={closeToast}
              style={{
                background: "#6c757d",
                color: "#fff",
                border: "none",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
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

  const handleClear = () => {
    setData({
      titleFa: "",
      titleEn: "",
      companyFa: "",
      companyEn: "",
      startDate: "",
      endDate: "",
      amount: "",
      descriptionFa: "",
      descriptionEn: "",
      websiteUrl: "",
      status: "active",
    });
    setAttachments([]);
    setErrors({});
    setActiveLang({ title: "fa", company: "fa", description: "fa" });
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

  const getStatusBadge = (statusValue, lang) => {
    const status =
      CONTRACT_STATUSES.find((item) => item.value === statusValue) ||
      CONTRACT_STATUSES[1];
    return (
      <span className={`status-tag ${statusValue}`}>
        {lang === "fa" ? status.labelFa : status.labelEn}
      </span>
    );
  };

  return (
    <div className="contract-page" dir="rtl">
      <div className="contract-card">
        <header className="contract-header">
          <div>
            <h1 className="contract-title">ثبت و مدیریت قرارداد جدید</h1>
            <p className="contract-subtitle">
              ورود اطلاعات دوزبانه، الصاق اسناد و فایل‌های ضمایم قرارداد و تعیین مواعد
            </p>
          </div>
          <span className="contract-badge">امور قراردادها</span>
        </header>

        <form onSubmit={handleSubmitClick} className="contract-form" noValidate>
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                <span className="required-star">*</span>
                موضوع / عنوان قرارداد{" "}
                {activeLang.title === "fa" ? "(فارسی)" : "(English)"}
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
                  placeholder="مثال: قرارداد پشتیبانی سامانه‌های پنجره واحد تجاری"
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
                placeholder="e.g. Single Window System Support and Maintenance Agreement"
                className="form-input"
              />
            )}
          </div>

          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                <span className="required-star">*</span>
                نام شرکت طرف قرارداد{" "}
                {activeLang.company === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("company")}
            </div>

            {activeLang.company === "fa" ? (
              <>
                <input
                  type="text"
                  name="companyFa"
                  dir="rtl"
                  value={data.companyFa}
                  onChange={handleChange}
                  placeholder="مثال: شرکت راهکارهای هوشمند تجارت"
                  className={`form-input ${errors.companyFa ? "input-has-error" : ""}`}
                />
                {errors.companyFa && (
                  <div className="error-message">{errors.companyFa}</div>
                )}
              </>
            ) : (
              <input
                type="text"
                name="companyEn"
                dir="ltr"
                value={data.companyEn}
                onChange={handleChange}
                placeholder="e.g. Smart Trade Solutions Co."
                className="form-input"
              />
            )}
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="field-label">
                <span className="required-star">*</span>
                تاریخ شروع
              </label>
              <input
                type="date"
                name="startDate"
                value={data.startDate}
                onChange={handleChange}
                className={`form-input ${errors.startDate ? "input-has-error" : ""}`}
              />
              {errors.startDate && (
                <div className="error-message">{errors.startDate}</div>
              )}
            </div>

            <div className="form-group">
              <label className="field-label">
                <span className="required-star">*</span>
                تاریخ پایان
              </label>
              <input
                type="date"
                name="endDate"
                value={data.endDate}
                onChange={handleChange}
                className={`form-input ${errors.endDate ? "input-has-error" : ""}`}
              />
              {errors.endDate && (
                <div className="error-message">{errors.endDate}</div>
              )}
            </div>

            <div className="form-group">
              <label className="field-label">وضعیت قرارداد</label>
              <select
                name="status"
                value={data.status}
                onChange={handleChange}
                className="form-select"
              >
                {CONTRACT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.labelFa} ({status.labelEn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="field-label">
                <span className="required-star">*</span>
                مبلغ کل قرارداد
              </label>

              <div className="amount-input-group">
                <input
                  type="text"
                  name="amount"
                  dir="ltr"
                  value={formatNumber(data.amount)}
                  onChange={handleChange}
                  placeholder="0"
                  className={`form-input ${errors.amount ? "input-has-error" : ""}`}
                />
                <span className="amount-unit">ریال</span>
              </div>

              {errors.amount && (
                <div className="error-message">{errors.amount}</div>
              )}
            </div>

            <div className="form-group">
              <label className="field-label">آدرس وب‌سایت طرف قرارداد</label>
              <input
                type="url"
                name="websiteUrl"
                dir="ltr"
                value={data.websiteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
                className={`form-input ${errors.websiteUrl ? "input-has-error" : ""}`}
              />
              {errors.websiteUrl && (
                <div className="error-message">{errors.websiteUrl}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                <span className="required-star">*</span>
                شرح و تعهدات قرارداد{" "}
                {activeLang.description === "fa" ? "(فارسی)" : "(English)"}
              </label>
              {renderLangSwitcher("description")}
            </div>

            {activeLang.description === "fa" ? (
              <>
                <textarea
                  name="descriptionFa"
                  dir="rtl"
                  rows={5}
                  value={data.descriptionFa}
                  onChange={handleChange}
                  placeholder="شرح کامل دامنه خدمات، تعهدات پیمانکار/کارفرما و شرایط مالی..."
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
                rows={5}
                value={data.descriptionEn}
                onChange={handleChange}
                placeholder="Detailed scope of services, obligations, and financial schedule..."
                className="form-textarea"
              />
            )}
          </div>

          <div className="form-group">
            <label className="field-label">
              اسناد و ضمائم قرارداد (فایل‌های پیوست)
            </label>

            <div
              className={`dropzone-area ${dragActive ? "drag-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg"
                style={{ display: "none" }}
              />

              <div className="dropzone-icon">📁</div>
              <p className="dropzone-text">
                فایل‌های نسخه امضاشده یا ضمائم قرارداد را به اینجا بکشید یا برای انتخاب کلیک کنید
              </p>
              <p className="dropzone-hint">
                فرمت‌های مجاز: PDF، Word، Excel، ZIP، RAR، تصاویر (حداکثر ۲۰ مگابایت برای هر فایل)
              </p>
            </div>

            {errors.attachments && (
              <div className="error-message">{errors.attachments}</div>
            )}

            {attachments.length > 0 && (
              <div className="attachments-list">
                {attachments.map((item) => (
                  <div key={item.id} className="attachment-item">
                    <div className="attachment-file-info">
                      <span className="attachment-ext-badge">{item.extension}</span>
                      <div className="attachment-file-details">
                        <span className="attachment-name" title={item.name}>
                          {item.name}
                        </span>
                        <span className="attachment-size">
                          {formatFileSize(item.size)}
                        </span>
                      </div>
                    </div>

                    <div className="attachment-meta-inputs">
                      <input
                        type="text"
                        placeholder="عنوان پیوست (فارسی)"
                        value={item.titleFa}
                        onChange={(event) =>
                          handleAttachmentMetaChange(
                            item.id,
                            "titleFa",
                            event.target.value
                          )
                        }
                        className="attachment-title-input"
                        dir="rtl"
                      />

                      <input
                        type="text"
                        placeholder="Attachment title (EN)"
                        value={item.titleEn}
                        onChange={(event) =>
                          handleAttachmentMetaChange(
                            item.id,
                            "titleEn",
                            event.target.value
                          )
                        }
                        className="attachment-title-input"
                        dir="ltr"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(item.id)}
                      className="btn-remove-attachment"
                      title="حذف این فایل"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="error-message" role="alert">
              {errors.submit}
            </div>
          )}

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
              {isSubmitting ? "در حال ثبت..." : "ثبت نهایی قرارداد"}
            </button>
          </div>
        </form>
      </div>

      {/* مودال پیش‌نمایش */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div
            className="preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="preview-modal-header">
              <h3>پیش‌نمایش اطلاعات قرارداد</h3>

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
              <h2 className="preview-main-title">
                {previewLang === "fa"
                  ? data.titleFa || "(بدون عنوان)"
                  : data.titleEn || "(Untitled Contract)"}
              </h2>

              <div className="preview-meta-grid">
                <div className="preview-meta-card">
                  <span className="preview-meta-label">
                    {previewLang === "fa" ? "طرف قرارداد" : "Counterparty"}
                  </span>
                  <span className="preview-meta-value">
                    {previewLang === "fa"
                      ? data.companyFa || "---"
                      : data.companyEn || "---"}
                  </span>
                </div>

                <div className="preview-meta-card">
                  <span className="preview-meta-label">
                    {previewLang === "fa" ? "مبلغ کل" : "Total Amount"}
                  </span>
                  <span className="preview-meta-value">
                    {data.amount ? `${formatNumber(data.amount)} ریال` : "---"}
                  </span>
                </div>

                <div className="preview-meta-card">
                  <span className="preview-meta-label">
                    {previewLang === "fa" ? "مدت قرارداد" : "Contract Period"}
                  </span>
                  <span className="preview-meta-value">
                    {data.startDate || "---"} الی {data.endDate || "---"}
                  </span>
                </div>

                <div className="preview-meta-card">
                  <span className="preview-meta-label">
                    {previewLang === "fa" ? "وضعیت" : "Status"}
                  </span>
                  <div>{getStatusBadge(data.status, previewLang)}</div>
                </div>
              </div>

              <div className="preview-section-title">
                {previewLang === "fa"
                  ? "شرح و مفاد قرارداد"
                  : "Contract Scope & Clauses"}
              </div>

              <div
                className={`preview-description-box ${
                  previewLang === "en" ? "ltr" : ""
                }`}
              >
                {previewLang === "fa"
                  ? data.descriptionFa || "توضیحاتی وارد نشده است."
                  : data.descriptionEn || "No English description provided."}
              </div>

              {data.websiteUrl && (
                <a
                  href={data.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="preview-link-btn"
                >
                  🔗{" "}
                  {previewLang === "fa"
                    ? "وب‌سایت مرتبط"
                    : "Associated Website"}
                </a>
              )}

              <div className="preview-section-title">
                {previewLang === "fa"
                  ? `فایل‌های پیوست (${attachments.length})`
                  : `Attachments (${attachments.length})`}
              </div>

              {attachments.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {previewLang === "fa"
                    ? "پیوستی افزوده نشده است."
                    : "No files attached."}
                </div>
              ) : (
                <div className="preview-attachments-list">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="preview-attachment-badge"
                    >
                      <span>
                        📎{" "}
                        {previewLang === "fa"
                          ? attachment.titleFa || attachment.name
                          : attachment.titleEn || attachment.name}
                      </span>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 12,
                        }}
                      >
                        {formatFileSize(attachment.size)}
                      </span>
                    </div>
                  ))}
                </div>
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

export default ContractAddForm;
