import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { uploadDirectiveMedia, postDirective, assignFileToDirective } from "../../services/LawsService";
import "./DirectiveAddForm.css";

const MAX_FILE_SIZE_MB = 20;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "zip", "rar", "jpg", "jpeg", "png"];

// لیست استان‌های ایران با نام مستقیم
const IRAN_PROVINCES = [
  { nameFa: "آذربایجان شرقی", nameEn: "East Azerbaijan" },
  { nameFa: "آذربایجان غربی", nameEn: "West Azerbaijan" },
  { nameFa: "اردبیل", nameEn: "Ardabil" },
  { nameFa: "اصفهان", nameEn: "Isfahan" },
  { nameFa: "البرز", nameEn: "Alborz" },
  { nameFa: "ایلام", nameEn: "Ilam" },
  { nameFa: "بوشهر", nameEn: "Bushehr" },
  { nameFa: "تهران", nameEn: "Tehran" },
  { nameFa: "چهارمحال و بختیاری", nameEn: "Chaharmahal and Bakhtiari" },
  { nameFa: "خراسان جنوبی", nameEn: "South Khorasan" },
  { nameFa: "خراسان رضوی", nameEn: "Razavi Khorasan" },
  { nameFa: "خراسان شمالی", nameEn: "North Khorasan" },
  { nameFa: "خوزستان", nameEn: "Khuzestan" },
  { nameFa: "زنجان", nameEn: "Zanjan" },
  { nameFa: "سمنان", nameEn: "Semnan" },
  { nameFa: "سیستان و بلوچستان", nameEn: "Sistan and Baluchestan" },
  { nameFa: "فارس", nameEn: "Fars" },
  { nameFa: "قزوین", nameEn: "Qazvin" },
  { nameFa: "قم", nameEn: "Qom" },
  { nameFa: "کردستان", nameEn: "Kurdistan" },
  { nameFa: "کرمان", nameEn: "Kerman" },
  { nameFa: "کرمانشاه", nameEn: "Kermanshah" },
  { nameFa: "کهگیلویه و بویراحمد", nameEn: "Kohgiluyeh and Boyer-Ahmad" },
  { nameFa: "گلستان", nameEn: "Golestan" },
  { nameFa: "گیلان", nameEn: "Gilan" },
  { nameFa: "لرستان", nameEn: "Lorestan" },
  { nameFa: "مازندران", nameEn: "Mazandaran" },
  { nameFa: "مرکزی", nameEn: "Markazi" },
  { nameFa: "هرمزگان", nameEn: "Hormozgan" },
  { nameFa: "همدان", nameEn: "Hamedan" },
  { nameFa: "یزد", nameEn: "Yazd" }
];

const initialFormData = {
  titleFa: "",
  titleEn: "",
  entityStatusId: 1,
  issuingAuthority: "",
  directiveNo: "", // مپ می‌شود به فیلد number در DTO
  approvalDate: "",
  significationDate: "",
  validityDate: "",
  summaryFa: "",
  summaryEn: "",
  bodyFa: "",
  bodyEn: "",
  keywordsFa: [],
  keywordsEn: [],
  province: "", // ذخیره مستقیم نام استان
  attachments: [], // [{ id, file, name, size, ext, titleFa, titleEn, description, languageId, sortOrder }]
};

const DirectiveAddForm = ({ onSubmit }) => {
  const fileInputRef = useRef(null);

  const [data, setData] = useState(initialFormData);
  const [activeLangTab, setActiveLangTab] = useState("fa"); // 'fa' | 'en'
  const [previewLang, setPreviewLang] = useState("fa"); // 'fa' | 'en'
  const [keywordInput, setKeywordInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // وضعیت‌های ارسال API
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleInputChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // افزودن کلمه کلیدی با دکمه یا کلید اینتر
  const handleAddKeyword = () => {
    const val = keywordInput.trim().replace(/^,+|,+$/g, "");
    if (!val) return;

    if (activeLangTab === "fa") {
      if (!data.keywordsFa.includes(val)) {
        setData((prev) => ({ ...prev, keywordsFa: [...prev.keywordsFa, val] }));
      }
    } else {
      if (!data.keywordsEn.includes(val)) {
        setData((prev) => ({ ...prev, keywordsEn: [...prev.keywordsEn, val] }));
      }
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (tag, lang) => {
    if (lang === "fa") {
      setData((prev) => ({ ...prev, keywordsFa: prev.keywordsFa.filter((k) => k !== tag) }));
    } else {
      setData((prev) => ({ ...prev, keywordsEn: prev.keywordsEn.filter((k) => k !== tag) }));
    }
  };

  // فایل‌ها و آپلود
  const handleFilesAdded = (filesList) => {
    const files = Array.from(filesList);
    const newAttachments = [];
    const errMessages = [];

    files.forEach((file) => {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const sizeMB = file.size / (1024 * 1024);

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errMessages.push(`پسوند «${ext}» در فایل «${file.name}» غیرمجاز است.`);
        return;
      }
      if (sizeMB > MAX_FILE_SIZE_MB) {
        errMessages.push(`حجم فایل «${file.name}» بیش از حد مجاز (${MAX_FILE_SIZE_MB}MB) است.`);
        return;
      }

      newAttachments.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        ext,
        titleFa: file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
        titleEn: "",
        description: "",
        languageId: 0,
        sortOrder: data.attachments.length + newAttachments.length,
      });
    });

    if (errMessages.length > 0) {
      toast.error(errMessages.join("\n"));
    }

    if (newAttachments.length > 0) {
      setData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments],
      }));
    }
  };

  const handleAttachmentChange = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      attachments: prev.attachments.map((att) => (att.id === id ? { ...att, [field]: value } : att)),
    }));
  };

  const handleRemoveAttachment = (id) => {
    setData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== id),
    }));
  };

  // اعتبارسنجی
  const validateForm = () => {
    const newErrors = {};
    if (!data.titleFa.trim()) newErrors.titleFa = "عنوان فارسی بخشنامه الزامی است.";
    if (!data.directiveNo.trim()) newErrors.directiveNo = "شماره بخشنامه الزامی است.";
    if (!data.issuingAuthority.trim()) newErrors.issuingAuthority = "مرجع صادرکننده الزامی است.";
    if (!data.approvalDate) newErrors.approvalDate = "تاریخ تصویب الزامی است.";
    if (!data.significationDate) newErrors.significationDate = "تاریخ ابلاغ الزامی است.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ارسال داده‌ها به API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn("لطفاً اطلاعات الزامی را تکمیل کنید.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      // مرحله اول: آپلود تمامی پیوست‌ها در مدیا سرور
      const uploadedResults = [];
      const totalAtts = data.attachments.length;

      for (let i = 0; i < totalAtts; i++) {
        const att = data.attachments[i];
        setStatusMessage(`در حال آپلود فایل پیوست (${i + 1} از ${totalAtts}): ${att.name}`);

        const uploadRes = await uploadDirectiveMedia(
          att.file,
          att.titleFa || att.name,
          att.description || "",
          "law"
        );

        const fileId = uploadRes?.fileId ?? uploadRes?.id ?? uploadRes?.data?.id ?? uploadRes?.data?.fileId;
        if (!fileId) {
          throw new Error(`شناسه فایل برای «${att.name}» از سرور بازگردانده نشد.`);
        }

        uploadedResults.push({
          fileId: Number(fileId),
          sortOrder: att.sortOrder ?? i,
          languageId: Number(att.languageId) || 0,
        });
      }

      // مرحله دوم: ایجاد بخشنامه / قانون با ارسال زمان جاری برای deactivateAt
      setStatusMessage("در حال ثبت اطلاعات بخشنامه...");
      const payload = {
        deactivateAt: new Date().toISOString(), // زمان جاری سرور ارسال می‌شود
        titleFa: data.titleFa.trim(),
        titleEn: data.titleEn.trim(),
        entityStatusId: Number(data.entityStatusId) || 1,
        issuingAuthority: data.issuingAuthority.trim(),
        number: data.directiveNo.trim(),
        approvalDate: data.approvalDate || null,
        significationDate: data.significationDate || null,
        validityDate: data.validityDate || null,
        summaryFa: data.summaryFa.trim(),
        summaryEn: data.summaryEn.trim(),
        bodyFa: data.bodyFa.trim(),
        bodyEn: data.bodyEn.trim(),
        keyWordsFa: data.keywordsFa.join(","),
        keyWordsEn: data.keywordsEn.join(","),
        province: data.province ? data.province.trim() : null, // ارسال نام مستقیم استان
      };

      const directiveRes = await postDirective(payload);
      const lawId = directiveRes?.lawId ?? directiveRes?.id ?? directiveRes?.data?.lawId ?? directiveRes?.data?.id;

      if (!lawId) {
        throw new Error("شناسه بخشنامه (lawId) در پاسخ سرور یافت نشد.");
      }

      // مرحله سوم: انتساب فایل‌ها به بخشنامه ثبت‌شده
      if (uploadedResults.length > 0) {
        setStatusMessage("در حال انتساب فایل‌های پیوست به بخشنامه...");
        for (let j = 0; j < uploadedResults.length; j++) {
          const item = uploadedResults[j];
          await assignFileToDirective({
            lawId: String(lawId),
            fileId: item.fileId,
            sortOrder: item.sortOrder,
            languageId: item.languageId,
          });
        }
      }

      setStatusMessage("عملیات با موفقیت پایان یافت.");
      toast.success("بخشنامه و تمامی پیوست‌های آن با موفقیت ثبت شدند.");

      if (onSubmit) {
        onSubmit({ success: true, lawId, payload });
      }

      setData(initialFormData);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "خطایی در ثبت بخشنامه رخ داد.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  const handleClear = () => {
    if (window.confirm("آیا از پاک کردن کامل اطلاعات فرم اطمینان دارید؟")) {
      setData(initialFormData);
      setErrors({});
    }
  };

  const currentKeywords = activeLangTab === "fa" ? data.keywordsFa : data.keywordsEn;

  return (
    <div className="directive-page">
      <div className="directive-card">
        {/* هدر کارت */}
        <div className="directive-header">
          <div>
            <h1 className="directive-title">ایجاد بخشنامه / مصوبه جدید</h1>
            <p className="directive-subtitle">
              اطلاعات، تاریخ‌ها، متن و فایل‌های پیوست بخشنامه را وارد کرده و ثبت نهایی نمایید.
            </p>
          </div>
          <span className="directive-badge">سامانه بخشنامه‌ها</span>
        </div>

        <form className="directive-form" onSubmit={handleSubmit}>
          {/* ردیف شماره و مرجع صادرکننده */}
          <div className="form-row-2">
            <div className="form-group">
              <div className="field-label-row">
                <label className="field-label">شماره بخشنامه *</label>
              </div>
              <input
                type="text"
                dir="ltr"
                className={`form-input ${errors.directiveNo ? "input-has-error" : ""}`}
                placeholder="مثال: 1403/123456"
                value={data.directiveNo}
                onChange={(e) => handleInputChange("directiveNo", e.target.value)}
                disabled={isSubmitting}
              />
              {errors.directiveNo && <div className="error-message">{errors.directiveNo}</div>}
            </div>

            <div className="form-group">
              <div className="field-label-row">
                <label className="field-label">مرجع صادرکننده *</label>
              </div>
              <input
                type="text"
                className={`form-input ${errors.issuingAuthority ? "input-has-error" : ""}`}
                placeholder="مثال: گمرک جمهوری اسلامی ایران"
                value={data.issuingAuthority}
                onChange={(e) => handleInputChange("issuingAuthority", e.target.value)}
                disabled={isSubmitting}
              />
              {errors.issuingAuthority && <div className="error-message">{errors.issuingAuthority}</div>}
            </div>
          </div>

          {/* ردیف تاریخ تصویب و تاریخ ابلاغ */}
          <div className="form-row-2">
            <div className="form-group">
              <div className="field-label-row">
                <label className="field-label">تاریخ تصویب *</label>
              </div>
              <input
                type="date"
                className={`form-input ${errors.approvalDate ? "input-has-error" : ""}`}
                value={data.approvalDate}
                onChange={(e) => handleInputChange("approvalDate", e.target.value)}
                disabled={isSubmitting}
              />
              {errors.approvalDate && <div className="error-message">{errors.approvalDate}</div>}
            </div>

            <div className="form-group">
              <div className="field-label-row">
                <label className="field-label">تاریخ ابلاغ *</label>
              </div>
              <input
                type="date"
                className={`form-input ${errors.significationDate ? "input-has-error" : ""}`}
                value={data.significationDate}
                onChange={(e) => handleInputChange("significationDate", e.target.value)}
                disabled={isSubmitting}
              />
              {errors.significationDate && <div className="error-message">{errors.significationDate}</div>}
            </div>
          </div>

          {/* ردیف تاریخ پایان اعتبار و وضعیت سند */}
          <div className="form-row-2">
            <div className="form-group">
              <div className="field-label-row">
                <label className="field-label">تاریخ پایان اعتبار (اختیاری)</label>
              </div>
              <input
                type="date"
                className="form-input"
                value={data.validityDate}
                onChange={(e) => handleInputChange("validityDate", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <div className="field-label-row">
                <label className="field-label">وضعیت سند</label>
              </div>
              <select
                className="form-input"
                value={data.entityStatusId}
                onChange={(e) => handleInputChange("entityStatusId", Number(e.target.value))}
                disabled={isSubmitting}
              >
                <option value={1}>فعال / لازم‌الاجرا</option>
                <option value={2}>منقضی شده</option>
                <option value={3}>ابطال شده</option>
                <option value={0}>پیش‌نویس</option>
              </select>
            </div>
          </div>

          {/* ردیف استان مربوطه */}
          <div className="form-row-2">
            <div className="form-group">
              <div className="field-label-row">
                <label className="field-label">
                  {activeLangTab === "fa" ? "استان مربوطه" : "Relevant Province"}
                </label>
              </div>
              <select
                className="form-input"
                value={data.province}
                onChange={(e) => handleInputChange("province", e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">
                  {activeLangTab === "fa" ? "-- سراسری (تمامی استان‌ها) --" : "-- National / All Provinces --"}
                </option>
                {IRAN_PROVINCES.map((prov) => (
                  <option key={prov.nameFa} value={prov.nameFa}>
                    {activeLangTab === "fa" ? prov.nameFa : `${prov.nameEn} (${prov.nameFa})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* فیلد عنوان بخشنامه همراه با سوئیچ زبانه */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                عنوان بخشنامه {activeLangTab === "fa" ? "(فارسی) *" : "(English)"}
              </label>
              <div className="lang-switcher">
                <button
                  type="button"
                  className={`lang-btn ${activeLangTab === "fa" ? "active" : ""}`}
                  onClick={() => setActiveLangTab("fa")}
                >
                  فارسی
                </button>
                <button
                  type="button"
                  className={`lang-btn ${activeLangTab === "en" ? "active" : ""}`}
                  onClick={() => setActiveLangTab("en")}
                >
                  EN
                </button>
              </div>
            </div>
            {activeLangTab === "fa" ? (
              <input
                type="text"
                className={`form-input ${errors.titleFa ? "input-has-error" : ""}`}
                placeholder="عنوان بخشنامه به زبان فارسی..."
                value={data.titleFa}
                onChange={(e) => handleInputChange("titleFa", e.target.value)}
                disabled={isSubmitting}
              />
            ) : (
              <input
                type="text"
                dir="ltr"
                className="form-input"
                placeholder="Directive title in English..."
                value={data.titleEn}
                onChange={(e) => handleInputChange("titleEn", e.target.value)}
                disabled={isSubmitting}
              />
            )}
            {activeLangTab === "fa" && errors.titleFa && (
              <div className="error-message">{errors.titleFa}</div>
            )}
          </div>

          {/* فیلد خلاصه بخشنامه */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                خلاصه بخشنامه {activeLangTab === "fa" ? "(فارسی)" : "(English)"}
              </label>
            </div>
            {activeLangTab === "fa" ? (
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="خلاصه مختصری از اهداف و مفاد بخشنامه..."
                value={data.summaryFa}
                onChange={(e) => handleInputChange("summaryFa", e.target.value)}
                disabled={isSubmitting}
              />
            ) : (
              <textarea
                dir="ltr"
                className="form-textarea"
                rows={3}
                placeholder="Brief summary of the directive..."
                value={data.summaryEn}
                onChange={(e) => handleInputChange("summaryEn", e.target.value)}
                disabled={isSubmitting}
              />
            )}
          </div>

          {/* فیلد متن کامل بخشنامه */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                متن کامل بخشنامه {activeLangTab === "fa" ? "(فارسی)" : "(English)"}
              </label>
            </div>
            {activeLangTab === "fa" ? (
              <textarea
                className="form-textarea"
                rows={7}
                placeholder="متن کامل مصوبه و بخشنامه..."
                value={data.bodyFa}
                onChange={(e) => handleInputChange("bodyFa", e.target.value)}
                disabled={isSubmitting}
              />
            ) : (
              <textarea
                dir="ltr"
                className="form-textarea"
                rows={7}
                placeholder="Full body text of the directive..."
                value={data.bodyEn}
                onChange={(e) => handleInputChange("bodyEn", e.target.value)}
                disabled={isSubmitting}
              />
            )}
          </div>

          {/* بخش کلمات کلیدی */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">
                کلمات کلیدی {activeLangTab === "fa" ? "(فارسی)" : "(English)"}
              </label>
            </div>
            <div className="keyword-input-wrapper">
              <input
                type="text"
                dir={activeLangTab === "en" ? "ltr" : "rtl"}
                className="form-input"
                placeholder={activeLangTab === "fa" ? "افزودن کلمه کلیدی..." : "Add keyword..."}
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn-add-keyword"
                onClick={handleAddKeyword}
                disabled={isSubmitting}
              >
                افزودن
              </button>
            </div>

            {currentKeywords.length > 0 && (
              <div className="chips-container">
                {currentKeywords.map((tag) => (
                  <span key={tag} className="keyword-chip">
                    {tag}
                    <button
                      type="button"
                      className="chip-remove-btn"
                      onClick={() => handleRemoveKeyword(tag, activeLangTab)}
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* بخش پیوست فایل (Attachments) */}
          <div className="form-group">
            <div className="field-label-row">
              <label className="field-label">فایل‌های پیوست</label>
            </div>
            <div
              className={`file-dropzone ${isDragging ? "dragging" : ""}`}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (!isSubmitting && e.dataTransfer.files) {
                  handleFilesAdded(e.dataTransfer.files);
                }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="file-dropzone-input"
                accept={ALLOWED_EXTENSIONS.map((x) => `.${x}`).join(",")}
                onChange={(e) => {
                  if (e.target.files) handleFilesAdded(e.target.files);
                  e.target.value = "";
                }}
                disabled={isSubmitting}
              />
              <div className="dropzone-title">
                برای انتخاب فایل‌ها <span>اینجا کلیک کنید</span> یا فایل‌ها را به این قسمت بکشید
              </div>
              <div className="dropzone-hint">
                فرمت‌های مجاز: PDF, DOC, DOCX, XLS, XLSX, ZIP, RAR, JPG, PNG (حداکثر ۲۰ مگابایت)
              </div>
            </div>

            {data.attachments.length > 0 && (
              <div className="attachments-list">
                {data.attachments.map((att) => (
                  <div key={att.id} className="attachment-item">
                    <div className="attachment-meta">
                      <div className="attachment-ext">{att.ext}</div>
                      <div className="attachment-info">
                        <div className="attachment-name" title={att.name}>{att.name}</div>
                        <div className="attachment-size">{(att.size / (1024 * 1024)).toFixed(2)} MB</div>
                      </div>
                    </div>

                    <div className="attachment-captions">
                      <input
                        type="text"
                        className="attachment-caption-input"
                        placeholder="عنوان فارسی پیوست"
                        value={att.titleFa}
                        onChange={(e) => handleAttachmentChange(att.id, "titleFa", e.target.value)}
                        disabled={isSubmitting}
                      />
                      <input
                        type="text"
                        dir="ltr"
                        className="attachment-caption-input"
                        placeholder="English Caption"
                        value={att.titleEn}
                        onChange={(e) => handleAttachmentChange(att.id, "titleEn", e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-remove-attachment"
                      onClick={() => handleRemoveAttachment(att.id)}
                      disabled={isSubmitting}
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* پیام وضعیت فرایند آپلود و ثبت */}
          {statusMessage && (
            <div style={{ marginTop: "16px", color: "var(--primary-color)", fontWeight: "bold", fontSize: "13px" }}>
              {statusMessage}
            </div>
          )}

          {/* دکمه‌های اکشن فرم */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-clear"
              onClick={handleClear}
              disabled={isSubmitting}
            >
              پاک کردن فرم
            </button>
            <button
              type="button"
              className="btn-preview"
              onClick={() => setIsModalOpen(true)}
              disabled={isSubmitting}
            >
              پیش‌نمایش بخشنامه
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "در حال ثبت اطلاعات..." : "ثبت نهایی بخشنامه"}
            </button>
          </div>
        </form>
      </div>

      {/* مودال پیش‌نمایش (Preview Modal) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
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
                    فارسی
                  </button>
                  <button
                    type="button"
                    className={`lang-btn ${previewLang === "en" ? "active" : ""}`}
                    onClick={() => setPreviewLang("en")}
                  >
                    EN
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="preview-modal-body">
              <div className="preview-meta-bar">
                <div className="preview-meta-item">
                  شماره: <span>{data.directiveNo || "---"}</span>
                </div>
                <div className="preview-meta-item">
                  مرجع صادرکننده: <span>{data.issuingAuthority || "---"}</span>
                </div>
                <div className="preview-meta-item">
                  استان: <span>{data.province || "سراسری (تمامی استان‌ها)"}</span>
                </div>
                <div className="preview-meta-item">
                  تاریخ تصویب: <span>{data.approvalDate || "---"}</span>
                </div>
                <div className="preview-meta-item">
                  تاریخ ابلاغ: <span>{data.significationDate || "---"}</span>
                </div>
              </div>

              {previewLang === "fa" ? (
                <>
                  <h2 className="preview-main-title">{data.titleFa || "عنوان بخشنامه ثبت نشده است"}</h2>

                  {data.summaryFa && (
                    <>
                      <div className="preview-section-title">خلاصه بخشنامه</div>
                      <div className="preview-summary-box">{data.summaryFa}</div>
                    </>
                  )}

                  <div className="preview-section-title">متن مصوبه</div>
                  <div className="preview-body-content">
                    {data.bodyFa || <span className="preview-empty-notice">متن اصلی بخشنامه وارد نشده است.</span>}
                  </div>

                  {data.keywordsFa.length > 0 && (
                    <>
                      <div className="preview-section-title">کلمات کلیدی</div>
                      <div className="preview-keywords-list">
                        {data.keywordsFa.map((tag) => (
                          <span key={tag} className="keyword-chip">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div dir="ltr" style={{ textAlign: "left" }}>
                  <h2 className="preview-main-title">{data.titleEn || "Directive title not specified"}</h2>

                  {data.summaryEn && (
                    <>
                      <div className="preview-section-title">SUMMARY</div>
                      <div className="preview-summary-box ltr">{data.summaryEn}</div>
                    </>
                  )}

                  <div className="preview-section-title">BODY</div>
                  <div className="preview-body-content">
                    {data.bodyEn || <span className="preview-empty-notice">No directive body provided.</span>}
                  </div>

                  {data.keywordsEn.length > 0 && (
                    <>
                      <div className="preview-section-title">KEYWORDS</div>
                      <div className="preview-keywords-list">
                        {data.keywordsEn.map((tag) => (
                          <span key={tag} className="keyword-chip">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {data.attachments.length > 0 && (
                <>
                  <div className="preview-section-title">فایل‌های پیوست ({data.attachments.length})</div>
                  <div className="preview-attachments-list">
                    {data.attachments.map((att) => (
                      <div key={att.id} className="preview-attachment-card">
                        <div className="attachment-ext">{att.ext}</div>
                        <div className="attachment-info">
                          <div className="attachment-name">
                            {previewLang === "fa" ? (att.titleFa || att.name) : (att.titleEn || att.name)}
                          </div>
                          <div className="attachment-size">{(att.size / (1024 * 1024)).toFixed(2)} MB</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="preview-modal-footer">
              <button
                type="button"
                className="btn-submit"
                onClick={() => setIsModalOpen(false)}
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
