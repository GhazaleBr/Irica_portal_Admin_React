import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MediaUploader.css';

const CATEGORY_OPTIONS = [
  'آموزشی',
  'گزارش و تحلیل',
  'مستند و آرشیو',
  'اخبار و اطلاعیه‌ها',
  'تبلیغات و بازاریابی',
  'اسناد و مدارک',
  'سایر موارد',
];

const MediaUploader = ({
  maxSizeMB = 20,
  maxFiles = 10,
  accept = 'image/*,video/*,audio/*',
  onDataChange,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // بستن دراپ‌دان در صورت کلیک بیرون از آن
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emitChange = useCallback(
    (next = {}) => {
      onDataChange?.({
        title: next.title ?? title,
        description: next.description ?? description,
        category: next.category ?? category,
        files: next.files ?? files.map((f) => f.file),
      });
    },
    [title, description, category, files, onDataChange]
  );

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getMediaType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'other';
  };

  const processFiles = (selectedFiles) => {
    setError('');

    const incoming = Array.from(selectedFiles);
    if (files.length + incoming.length > maxFiles) {
      setError(`حداکثر تعداد فایل مجاز ${maxFiles} عدد است.`);
      return;
    }

    const validFiles = [];
    for (const file of incoming) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`حجم فایل «${file.name}» بیشتر از ${maxSizeMB} مگابایت است.`);
        continue;
      }

      const mediaType = getMediaType(file.type);
      if (mediaType === 'other') {
        setError(`فرمت فایل «${file.name}» پشتیبانی نمی‌شود.`);
        continue;
      }

      validFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: mediaType,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (validFiles.length > 0) {
      const updated = [...files, ...validFiles];
      setFiles(updated);
      emitChange({ files: updated.map((i) => i.file) });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const handleRemove = (id) => {
    const target = files.find((f) => f.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    emitChange({ files: updated.map((i) => i.file) });
  };

  const handleClearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setError('');
    emitChange({ files: [] });
  };

  const handleCategorySelect = (item) => {
    setCategory(item);
    setIsDropdownOpen(false);
    emitChange({ category: item });
  };

  return (
    <div className="mu-container" dir="rtl">
      {/* بخش متادیتا */}
      <div className="mu-meta">
        <div className="mu-field">
          <label className="mu-label">
            عنوان <span className="mu-required">*</span>
          </label>
          <input
            type="text"
            className="mu-input"
            value={title}
            maxLength={120}
            placeholder="عنوان محتوای چندرسانه‌ای را بنویسید..."
            onChange={(e) => {
              setTitle(e.target.value);
              emitChange({ title: e.target.value });
            }}
          />
        </div>

        {/* فیلد دراپ‌باکس طبقه‌بندی */}
        <div className="mu-field" ref={dropdownRef}>
          <label className="mu-label">طبقه‌بندی موضوعی</label>
          <div className="mu-dropdown">
            <button
              type="button"
              className={`mu-dropdown-trigger ${isDropdownOpen ? 'mu-dropdown-open' : ''}`}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <span className={category ? 'mu-dropdown-value' : 'mu-dropdown-placeholder'}>
                {category || 'یک دسته‌بندی انتخاب کنید...'}
              </span>
              <svg
                className={`mu-dropdown-arrow ${isDropdownOpen ? 'mu-arrow-up' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="mu-dropdown-menu">
                {CATEGORY_OPTIONS.map((item) => (
                  <li
                    key={item}
                    className={`mu-dropdown-item ${category === item ? 'mu-item-selected' : ''}`}
                    onClick={() => handleCategorySelect(item)}
                  >
                    <span>{item}</span>
                    {category === item && <span className="mu-check-icon">✓</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mu-field">
          <label className="mu-label">توضیحات</label>
          <textarea
            className="mu-textarea"
            rows={3}
            value={description}
            maxLength={500}
            placeholder="توضیحات یا یادداشت درباره این فایل‌ها..."
            onChange={(e) => {
              setDescription(e.target.value);
              emitChange({ description: e.target.value });
            }}
          />
        </div>
      </div>

      {/* بخش آپلود فایل */}
      <div
        className={`mu-dropzone ${isDragging ? 'mu-dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="mu-hidden-input"
          onChange={(e) => {
            if (e.target.files?.length) {
              processFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        <div className="mu-icon-wrapper">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ce8b0d"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <p className="mu-title">فایل‌های چندرسانه‌ای را اینجا بکشید و رها کنید</p>
        <p className="mu-subtitle">
          پشتیبانی از عکس، ویدیو و فایل صوتی (حداکثر {maxSizeMB} مگابایت)
        </p>

        <button
          type="button"
          className="mu-select-btn"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          انتخاب فایل
        </button>
      </div>

      {error && <div className="mu-error">{error}</div>}

      {/* پیش‌نمایش فایل‌ها */}
      {files.length > 0 && (
        <div className="mu-preview-section">
          <div className="mu-preview-header">
            <span>فایل‌های انتخاب‌شده ({files.length})</span>
            <button type="button" className="mu-clear-btn" onClick={handleClearAll}>
              حذف همه
            </button>
          </div>

          <div className="mu-grid">
            {files.map((item) => (
              <div key={item.id} className="mu-card">
                <button
                  type="button"
                  className="mu-remove-btn"
                  onClick={() => handleRemove(item.id)}
                  title="حذف"
                >
                  ×
                </button>

                <div className="mu-media-box">
                  {item.type === 'image' && (
                    <img src={item.previewUrl} alt={item.name} className="mu-media" />
                  )}
                  {item.type === 'video' && (
                    <video src={item.previewUrl} controls className="mu-media" />
                  )}
                  {item.type === 'audio' && (
                    <div className="mu-audio-box">
                      <span className="mu-audio-badge">صدا</span>
                      <audio src={item.previewUrl} controls className="mu-audio" />
                    </div>
                  )}
                </div>

                <div className="mu-info">
                  <span className="mu-filename" title={item.name}>
                    {item.name}
                  </span>
                  <span className="mu-filesize">{item.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
