import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, Loader2 } from 'lucide-react';
import './CreateSubPortal.css';

const INITIAL_FORM = {
  title: '',
  slug: '',
  customDomain: '',
  adminEmail: '',
  themeColor: '#2563eb',
  isActive: true,
  description: ''
};

export default function CreateSubPortal({ onSuccess, onCancel, apiEndpoint = '/api/subportals' }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // اعتبارسنجی فیلدها قبل از ارسال
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'نام زیرپورتال الزامی است.';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'شناسه مسیر (Slug) الزامی است.';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'فقط حروف کوچک انگلیسی، اعداد و خط تیره (-) مجاز است.';
    }

    if (formData.adminEmail && !/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'فرمت ایمیل نامعتبر است.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(apiEndpoint, {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase(),
        customDomain: formData.customDomain.trim() || null,
        adminEmail: formData.adminEmail.trim() || null,
        themeColor: formData.themeColor,
        isActive: formData.isActive,
        description: formData.description.trim() || null
      });

      toast.success('زیرپورتال با موفقیت ایجاد گردید.');
      setFormData(INITIAL_FORM);

      if (typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'خطا در برقراری ارتباط با سرور و ایجاد زیرپورتال.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="subportal-wrapper">
      <div className="subportal-header">
        <h2>تعریف زیرپورتال جدید</h2>
        <p>مشخصات، مسیر دسترسی و پیکربندی اولیه زیرپورتال را وارد نمایید.</p>
      </div>

      <form onSubmit={handleSubmit} className="subportal-form" noValidate>
        <div className="form-grid">
          {/* عنوان پورتال */}
          <div className="form-group">
            <label htmlFor="title">عنوان زیرپورتال *</label>
            <input
              id="title"
              name="title"
              type="text"
              className={`form-input ${errors.title ? 'is-invalid' : ''}`}
              placeholder="مثال: پورتال امور گمرکی غرب"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* شناسه مسیر / اسلاگ */}
          <div className="form-group">
            <label htmlFor="slug">شناسه مسیر (URL Slug) *</label>
            <input
              id="slug"
              name="slug"
              type="text"
              className={`form-input ltr-input ${errors.slug ? 'is-invalid' : ''}`}
              placeholder="e.g. west-customs"
              value={formData.slug}
              onChange={handleChange}
            />
            {errors.slug && <span className="error-text">{errors.slug}</span>}
          </div>

          {/* دامنه اختصاصی (اختیاری) */}
          <div className="form-group">
            <label htmlFor="customDomain">دامنه اختصاصی (اختیاری)</label>
            <input
              id="customDomain"
              name="customDomain"
              type="text"
              className="form-input ltr-input"
              placeholder="e.g. customs.domain.ir"
              value={formData.customDomain}
              onChange={handleChange}
            />
          </div>

          {/* ایمیل مدیر زیرپورتال */}
          <div className="form-group">
            <label htmlFor="adminEmail">ایمیل مدیر زیرپورتال</label>
            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              className={`form-input ltr-input ${errors.adminEmail ? 'is-invalid' : ''}`}
              placeholder="admin@domain.ir"
              value={formData.adminEmail}
              onChange={handleChange}
            />
            {errors.adminEmail && <span className="error-text">{errors.adminEmail}</span>}
          </div>

          {/* رنگ تم */}
          <div className="form-group">
            <label htmlFor="themeColor">رنگ سازمانی / تم</label>
            <input
              id="themeColor"
              name="themeColor"
              type="color"
              className="form-input"
              style={{ height: '42px', padding: '4px 6px', cursor: 'pointer' }}
              value={formData.themeColor}
              onChange={handleChange}
            />
          </div>

          {/* وضعیت فعال بودن */}
          <div className="form-group" style={{ justifyContent: 'center' }}>
            <label>وضعیت دسترسی</label>
            <label className="form-checkbox">
              <input
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span>زیرپورتال بلافاصله پس از ایجاد فعال باشد</span>
            </label>
          </div>

          {/* توضیحات */}
          <div className="form-group full-width">
            <label htmlFor="description">توضیحات و یادداشت</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-textarea"
              placeholder="توضیحات تکمیلی پیرامون حوزه اختیارات یا واحدهای مرتبط..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              انصراف
            </button>
          )}

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                ایجاد زیرپورتال
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
