import React, { useRef, useState } from "react";
import { toJpeg, toSvg} from "html-to-image";
import "./BannerCustomizer.css";
import banner from "../../assets/img/app9.svg";

const DEFAULT_BANNER_BG = banner;
const DEFAULT_LEFT_ICON = "";

const DEFAULT_CONTENT = {
  title: "راه اندازی پورتال جدید گمرک جمهوری اسلامی",
  description:
    "پورتال جدید گمرک با تلاش متخصصان واحد نرم افزار راه اندازی شد",
  leftImage: DEFAULT_LEFT_ICON,
  textAlign: "right",
};

const DEFAULT_POSITIONS = {
  icon: {
    left: 8,
    top: 20,
  },
  text: {
    left: 8,
    top: 58,
  },
};

const BannerCustomizer = ({ onSave }) => {
  const previewRef = useRef(null);
  const dragRef = useRef(null);

  const [bgImage, setBgImage] = useState(DEFAULT_BANNER_BG);

  const [bannerContent, setBannerContent] = useState({
    ...DEFAULT_CONTENT,
  });

  const [positions, setPositions] = useState({
    icon: { ...DEFAULT_POSITIONS.icon },
    text: { ...DEFAULT_POSITIONS.text },
  });

  const [dragging, setDragging] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  /*
   * محدود کردن مقدار بین حداقل و حداکثر
   */
  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };

  /*
   * تغییر مقدار فیلدهای متنی
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBannerContent((previousContent) => ({
      ...previousContent,
      [name]: value,
    }));
  };

  /*
   * شروع جابه‌جایی متن یا آیکون
   */
  const handlePointerDown = (type, event) => {
    event.preventDefault();
    event.stopPropagation();

    const element = event.currentTarget;
    const elementRect = element.getBoundingClientRect();

    dragRef.current = {
      type,
      element,
      pointerId: event.pointerId,
      offsetX: event.clientX - elementRect.left,
      offsetY: event.clientY - elementRect.top,
    };

    setDragging(type);

    if (element.setPointerCapture) {
      element.setPointerCapture(event.pointerId);
    }
  };

  /*
   * جابه‌جایی هنگام حرکت موس یا لمس
   */
  const handlePointerMove = (event) => {
    const activeDrag = dragRef.current;
    const previewElement = previewRef.current;

    if (!activeDrag || !previewElement) {
      return;
    }

    const previewRect = previewElement.getBoundingClientRect();
    const elementRect = activeDrag.element.getBoundingClientRect();

    if (!previewRect.width || !previewRect.height) {
      return;
    }

    // محاسبه مختصات خام بر اساس نشانگر موس
    const rawLeft =
      event.clientX - previewRect.left - activeDrag.offsetX;

    const rawTop =
      event.clientY - previewRect.top - activeDrag.offsetY;

    // ۱. محدود کردن لبه سمت راست المان تا حداکثر ۵۰٪ عرض بنر (نیمه سمت چپ بنر)
    const halfWidth = previewRect.width * 0.5; // مرز نیمه سمت چپ
    const maxLeft = Math.max(0, halfWidth - elementRect.width);

    // ۲. محدودیت عمودی (کل ارتفاع بنر)
    const maxTop = Math.max(0, previewRect.height - elementRect.height);

    // اعمال محدودیت‌ها (clamp)
    const leftPx = clamp(rawLeft, 0, maxLeft);
    const topPx = clamp(rawTop, 0, maxTop);

    // تبدیل به درصد
    const leftPercent = (leftPx / previewRect.width) * 100;
    const topPercent = (topPx / previewRect.height) * 100;

    setPositions((previousPositions) => ({
      ...previousPositions,
      [activeDrag.type]: {
        left: leftPercent,
        top: topPercent,
      },
    }));
  };

  /*
   * پایان جابه‌جایی
   */
  const handlePointerUp = (event) => {
    const activeDrag = dragRef.current;

    if (!activeDrag) {
      return;
    }

    if (
      activeDrag.element.releasePointerCapture &&
      activeDrag.element.hasPointerCapture &&
      activeDrag.element.hasPointerCapture(event.pointerId)
    ) {
      activeDrag.element.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setDragging(null);
  };

  const handleLostPointerCapture = () => {
    dragRef.current = null;
    setDragging(null);
  };

  /*
   * آپلود آیکون سمت چپ
   */
  const handleLeftImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("لطفاً یک فایل تصویری انتخاب کنید.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("حجم تصویر آیکون نباید بیشتر از ۲ مگابایت باشد.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBannerContent((previousContent) => ({
        ...previousContent,
        leftImage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRemoveLeftImage = () => {
    setBannerContent((previousContent) => ({
      ...previousContent,
      leftImage: "",
    }));
  };

  /*
   * آپلود تصویر پس‌زمینه
   */
  const handleBgImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("لطفاً یک فایل تصویری انتخاب کنید.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("حجم تصویر پس‌زمینه نباید بیشتر از ۵ مگابایت باشد.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBgImage(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleResetBackground = () => {
    setBgImage(DEFAULT_BANNER_BG);
  };

  /*
   * بازنشانی کامل
   */
  const handleReset = () => {
    setBgImage(DEFAULT_BANNER_BG);
    setBannerContent({ ...DEFAULT_CONTENT });
    setPositions({
      icon: { ...DEFAULT_POSITIONS.icon },
      text: { ...DEFAULT_POSITIONS.text },
    });
    dragRef.current = null;
    setDragging(null);
  };

  /*
   * ذخیره و خروجی تصویر به صورت JPEG
   */
  const handleSaveAndExport = async () => {
    if (!previewRef.current) return;

    try {
      setIsExporting(true);

      // فیلتر کردن لایه‌های اضافه مانند متن راهنمای درگ
      const filter = (node) => {
        return !node.classList?.contains("drag-help-text");
      };

      // تولید فایل JPEG با کیفیت 0.95 و مقیاس بالا برای وضوح مناسب (2x)
      const dataUrl = await toJpeg(previewRef.current, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: filter,
      });

      // ایجاد لینک دانلود در مرورگر
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `custom-banner-${timestamp}.jpeg`;
      link.href = dataUrl;
      link.click();

      // ارسال دیتا به کامپوننت والد در صورت تعریف onSave
      if (typeof onSave === "function") {
        onSave({
          imageJpeg: dataUrl,
          title: bannerContent.title,
          description: bannerContent.description,
          positions,
        });
      }
    } catch (error) {
      console.error("خطا در صدور فایل JPEG:", error);
      alert("متأسفانه در فرآیند تولید تصویر بنر خطایی رخ داد.");
    } finally {
      setIsExporting(false);
    }
  };

    /*
   * ذخیره و خروجی تصویر به صورت فایل برداری SVG
   */
  const handleSaveAndExportSvg = async () => {
    if (!previewRef.current) return;

    try {
      setIsExporting(true);

      // فیلتر کردن راهنمای جابه‌جایی
      const filter = (node) => {
        return !node.classList?.contains("drag-help-text");
      };

      // تولید خروجی SVG
      const dataUrl = await toSvg(previewRef.current, {
        filter: filter,
      });

      // ایجاد لینک و دانلود خودکار
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `custom-banner-${timestamp}.svg`;
      link.href = dataUrl;
      link.click();

      if (typeof onSave === "function") {
        onSave({
          imageSvg: dataUrl,
          title: bannerContent.title,
          description: bannerContent.description,
          positions,
        });
      }
    } catch (error) {
      console.error("خطا در صدور فایل SVG:", error);
      alert("متأسفانه در فرآیند تولید فایل SVG خطایی رخ داد.");
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="banner-page" dir="rtl">
      <div className="banner-container">
        <div className="banner-card">
          {/* عنوان صفحه */}
          <div className="banner-header">
            <h2>شخصی‌سازی بنر</h2>
            <p>
              متن و تصویر را با موس جابه‌جا کنید و با کلیک روی دکمه ذخیره، فایل JPEG آن را دریافت نمایید.
            </p>
          </div>

          {/* پیش‌نمایش بنر */}
          <section className="preview-section">
            <div className="section-label">
              <span>👁️</span>
              <span>پیش‌نمایش بنر</span>
            </div>

            <div
              ref={previewRef}
              className="banner-display-wrapper"
              style={{
                backgroundImage: `url(${bgImage})`,
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onLostPointerCapture={handleLostPointerCapture}
            >
              {/* آیکون قابل جابه‌جایی */}
              {bannerContent.leftImage && (
                <img
                  src={bannerContent.leftImage}
                  alt="آیکون بنر"
                  className={`banner-left-image ${
                    dragging === "icon" ? "is-dragging" : ""
                  }`}
                  style={{
                    left: `${positions.icon.left}%`,
                    top: `${positions.icon.top}%`,
                  }}
                  onPointerDown={(event) =>
                    handlePointerDown("icon", event)
                  }
                  draggable={false}
                />
              )}

              {/* بلوک عنوان و متن قابل جابه‌جایی */}
              <div
                className={`banner-left-content ${
                  dragging === "text" ? "is-dragging" : ""
                }`}
                style={{
                  left: `${positions.text.left}%`,
                  top: `${positions.text.top}%`,
                  textAlign: bannerContent.textAlign,
                }}
                onPointerDown={(event) =>
                  handlePointerDown("text", event)
                }
              >
                {bannerContent.title && (
                  <h1 className="banner-title">{bannerContent.title}</h1>
                )}

                {bannerContent.description && (
                  <p className="banner-desc">{bannerContent.description}</p>
                )}
              </div>

              {/* متن راهنما (در زمان خروجی JPEG خودکار فیلتر و حذف می‌شود) */}
              {!isExporting && (
                <div className="drag-help-text">
                  برای جابه‌جایی، متن یا آیکون را بکشید
                </div>
              )}
            </div>
          </section>

          {/* بخش تنظیمات و فرم‌ها */}
          <div className="editor-grid">
            <div className="editor-box">
              <div className="editor-box-title">✍️ ویرایش متن بنر</div>

              <div className="form-group">
                <label className="form-label" htmlFor="banner-title">
                  عنوان اصلی بنر:
                </label>
                <input
                  id="banner-title"
                  type="text"
                  name="title"
                  value={bannerContent.title}
                  onChange={handleInputChange}
                  placeholder="عنوان بنر را وارد کنید"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="banner-description">
                  متن توضیحی بنر:
                </label>
                <textarea
                  id="banner-description"
                  name="description"
                  rows={4}
                  value={bannerContent.description}
                  onChange={handleInputChange}
                  placeholder="توضیحات بنر را وارد کنید"
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="banner-text-align">
                  تراز متن داخل بنر:
                </label>
                <select
                  id="banner-text-align"
                  name="textAlign"
                  value={bannerContent.textAlign}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="right">راست‌چین</option>
                  <option value="center">وسط‌چین</option>
                  <option value="left">چپ‌چین</option>
                </select>
              </div>
            </div>

            <div className="editor-box">
              <div className="editor-box-title">🖼️ مدیریت تصاویر</div>

              <div className="form-group">
                <label className="form-label">تصویر یا آیکون بنر:</label>
                <label className="upload-dropzone">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">برای انتخاب آیکون کلیک کنید</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLeftImageUpload}
                    hidden
                  />
                </label>

                {bannerContent.leftImage && (
                  <div className="image-preview-thumb">
                    <img src={bannerContent.leftImage} alt="پیش‌نمایش آیکون" />
                    <button
                      type="button"
                      className="btn-remove-img"
                      onClick={handleRemoveLeftImage}
                    >
                      حذف تصویر
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group image-background-group">
                <label className="form-label">تصویر پس‌زمینه:</label>
                <label className="upload-dropzone">
                  <span className="upload-icon">🌄</span>
                  <span className="upload-text">تعویض پس‌زمینه پیش‌فرض با تصویر دلخواه</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageUpload}
                    hidden
                  />
                </label>

                {bgImage !== DEFAULT_BANNER_BG && (
                  <div className="image-preview-thumb">
                    <img src={bgImage} alt="پیش‌نمایش پس‌زمینه" />
                    <button
                      type="button"
                      className="btn-remove-img"
                      onClick={handleResetBackground}
                    >
                      بازگشت به app9
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* نوار دکمه‌ها */}
          <div className="actions-bar">
            <button
              type="button"
              onClick={handleReset}
              className="btn-reset"
              disabled={isExporting}
            >
              بازنشانی کامل
            </button>

            <button
              type="button"
              onClick={handleSaveAndExport}
              className="btn-submit"
              disabled={isExporting}
            >
              {isExporting ? "در حال ایجاد تصویر JPEG..." : "ذخیره و دانلود بنر (JPEG)"}
            </button>
            {/* دکمه خروجی برداری SVG */}
            <button
              type="button"
              onClick={handleSaveAndExportSvg}
              className="btn-submit btn-svg"
              disabled={isExporting}
            >
              {isExporting ? "در حال پردازش..." : "دانلود بنر (SVG)"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCustomizer;
