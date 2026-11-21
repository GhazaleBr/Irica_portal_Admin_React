// TenderForm.jsx
import React, { useEffect, useState } from 'react';
import tenderService from '../../services/TenderService'; // مسیر را متناسب با پروژه تنظیم کنید
import './TenderForm.css';

const initialValues = {
  deactivateAt: '',
  organization: '',
  department: '',
  tenderTypeId: 0,
  entityStatusId: 0,
  serialNumber: '',
  titleFa: '',
  titleEn: '',
  publisherUnit: '',
  publishDate: '',
  editDate: '',
  publishMedia: '',
  mediaPublishDate: '',
  location: '',
  payPriceTypeId: 0,
  receivingDeadline: '',
  proposalDeadline: '',
  openingDate: '',
  renewal: false,
  tenderStatusId: 0,
  amount: 0,
  groupId: '',
  keyWordsFa: '',
  keyWordsEn: '',
  hasSchedule: false,
  scheduleStartDate: '',
  scheduleStartTime: '',
  scheduleEndDate: '',
  scheduleEndTime: '',
  descriptionFa: '',
  descriptionEn: '',
  guaranteeFa: '',
  guaranteeEn: '',
  participantConditionsFa: '',
  participantConditionsEn: '',
  documentConditionsFa: '',
  documentConditionsEn: '',
  winnerFa: '',
  winnerEn: '',
  imageFaId: 0,
  imageEnId: 0,
  provinceId: 0,
  tenderModifiedId: 0,
};

const numberFields = [
  'tenderTypeId',
  'entityStatusId',
  'payPriceTypeId',
  'tenderStatusId',
  'amount',
  'imageFaId',
  'imageEnId',
  'provinceId',
  'tenderModifiedId',
];

// مقدار ISO دریافتی از API را به زمان محلی مناسب datetime-local تبدیل می‌کند.
const toLocalDateTime = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 16);
};

const buildFormData = (data) => {
  const values = Object.fromEntries(
    Object.keys(initialValues).map((key) => [
      key,
      data?.[key] ?? initialValues[key],
    ])
  );

  values.deactivateAt = toLocalDateTime(data?.deactivateAt);
  return values;
};

const TenderForm = ({
  initialData = null,
  tenderId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState(() => buildFormData(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const id = tenderId ?? initialData?.id;
  const isEdit = id !== undefined && id !== null && id !== '';

  // اگر دادهٔ ویرایش پس از بارگذاری API به فرم برسد، فیلدها به‌روز می‌شوند.
  useEffect(() => {
    setFormData(buildFormData(initialData));
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : numberFields.includes(name)
            ? value === '' ? '' : Number(value)
            : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      ...formData,
      deactivateAt: formData.deactivateAt
        ? new Date(formData.deactivateAt).toISOString()
        : null,
    };

    // ورودی عددیِ پاک‌شده را مطابق مقادیر اولیهٔ فرم به ۰ برمی‌گرداند.
    numberFields.forEach((field) => {
      payload[field] =
        formData[field] === '' ? 0 : Number(formData[field]);
    });

    try {
      const result = isEdit
        ? await tenderService.updateTender(id, payload)
        : await tenderService.createTender(payload);

      setSuccessMessage(
        isEdit
          ? 'مناقصه با موفقیت ویرایش شد.'
          : 'مناقصه با موفقیت ثبت شد.'
      );

      if (!isEdit) {
        setFormData(buildFormData(null));
      }

      // callback اختیاری، پس از موفقیت API اجرا می‌شود.
      onSubmit?.(result);
    } catch (error) {
      const serverMessage = error.response?.data?.message;

      setErrorMessage(
        typeof serverMessage === 'string'
          ? serverMessage
          : Array.isArray(serverMessage)
            ? serverMessage.join('، ')
            : error.message || 'ثبت اطلاعات انجام نشد.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (name, label, type = 'text', options = {}) => (
    <label
      className={`tender-field ${options.full ? 'tender-field-full' : ''}`}
      key={name}
    >
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={formData[name] ?? ''}
        onChange={handleChange}
        required={options.required}
        step={type === 'number' ? 'any' : undefined}
        dir={options.ltr ? 'ltr' : undefined}
      />
    </label>
  );

  const renderTextarea = (name, label, options = {}) => (
    <label
      className={`tender-field ${options.full ? 'tender-field-full' : ''}`}
      key={name}
    >
      <span>{label}</span>
      <textarea
        name={name}
        value={formData[name] ?? ''}
        onChange={handleChange}
        rows={options.rows || 4}
        dir={options.ltr ? 'ltr' : undefined}
      />
    </label>
  );

  const renderSwitch = (name, label) => (
    <label className="tender-switch" key={name}>
      <input
        name={name}
        type="checkbox"
        checked={Boolean(formData[name])}
        onChange={handleChange}
      />
      <span>{label}</span>
    </label>
  );

  return (
    <form className="tender-form" onSubmit={handleSubmit}>
      <header className="tender-form-header">
        <div>
          <h1>{isEdit ? 'ویرایش مناقصه' : 'ثبت مناقصه'}</h1>
          <p>اطلاعات مناقصه را وارد کنید.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="tender-form-error" role="alert">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="tender-form-success" role="status">
          {successMessage}
        </div>
      )}

      <section className="tender-form-section">
        <h2>اطلاعات اصلی</h2>
        <div className="tender-form-grid">
          {renderInput('titleFa', 'عنوان فارسی', 'text', { required: true })}
          {renderInput('titleEn', 'عنوان انگلیسی', 'text', { ltr: true })}
          {renderInput('serialNumber', 'شماره سریال')}
          {renderInput('organization', 'سازمان')}
          {renderInput('department', 'دپارتمان')}
          {renderInput('publisherUnit', 'واحد ناشر')}
          {renderInput('location', 'محل برگزاری')}
          {renderInput('groupId', 'شناسه گروه')}
          {renderInput('tenderTypeId', 'شناسه نوع مناقصه', 'number')}
          {renderInput('entityStatusId', 'شناسه وضعیت موجودیت', 'number')}
          {renderInput('tenderStatusId', 'شناسه وضعیت مناقصه', 'number')}
          {renderInput('tenderModifiedId', 'شناسه ویرایش مناقصه', 'number')}
          {renderInput('provinceId', 'شناسه استان', 'number')}
          {renderInput('payPriceTypeId', 'شناسه نوع پرداخت', 'number')}
          {renderInput('amount', 'مبلغ', 'number')}
          {renderInput('deactivateAt', 'زمان غیرفعال‌سازی', 'datetime-local')}
        </div>
      </section>

      <section className="tender-form-section">
        <h2>انتشار و مهلت‌ها</h2>
        <div className="tender-form-grid">
          {renderInput('publishDate', 'تاریخ انتشار', 'date')}
          {renderInput('editDate', 'تاریخ ویرایش', 'date')}
          {renderInput('publishMedia', 'رسانه انتشار')}
          {renderInput('mediaPublishDate', 'تاریخ انتشار در رسانه', 'date')}
          {renderInput('receivingDeadline', 'مهلت دریافت اسناد', 'date')}
          {renderInput('proposalDeadline', 'مهلت ارائه پیشنهاد', 'date')}
          {renderInput('openingDate', 'تاریخ بازگشایی', 'date')}
          {renderSwitch('renewal', 'مناقصه تجدید شده است')}
        </div>
      </section>

      <section className="tender-form-section">
        <h2>زمان‌بندی</h2>
        <div className="tender-form-grid">
          {renderSwitch('hasSchedule', 'دارای زمان‌بندی است')}
          {formData.hasSchedule && (
            <>
              {renderInput('scheduleStartDate', 'تاریخ شروع', 'date')}
              {renderInput('scheduleStartTime', 'ساعت شروع', 'time')}
              {renderInput('scheduleEndDate', 'تاریخ پایان', 'date')}
              {renderInput('scheduleEndTime', 'ساعت پایان', 'time')}
            </>
          )}
        </div>
      </section>

      <section className="tender-form-section">
        <h2>کلیدواژه‌ها و تصاویر</h2>
        <div className="tender-form-grid">
          {renderInput('keyWordsFa', 'کلیدواژه‌های فارسی')}
          {renderInput('keyWordsEn', 'کلیدواژه‌های انگلیسی', 'text', {
            ltr: true,
          })}
          {renderInput('imageFaId', 'شناسه تصویر فارسی', 'number')}
          {renderInput('imageEnId', 'شناسه تصویر انگلیسی', 'number')}
        </div>
      </section>

      <section className="tender-form-section">
        <h2>شرح و شرایط</h2>
        <div className="tender-form-grid">
          {renderTextarea('descriptionFa', 'شرح فارسی', { full: true })}
          {renderTextarea('descriptionEn', 'شرح انگلیسی', {
            full: true,
            ltr: true,
          })}
          {renderTextarea('guaranteeFa', 'تضمین فارسی')}
          {renderTextarea('guaranteeEn', 'تضمین انگلیسی', { ltr: true })}
          {renderTextarea('participantConditionsFa', 'شرایط شرکت‌کنندگان فارسی')}
          {renderTextarea('participantConditionsEn', 'شرایط شرکت‌کنندگان انگلیسی', {
            ltr: true,
          })}
          {renderTextarea('documentConditionsFa', 'شرایط اسناد فارسی')}
          {renderTextarea('documentConditionsEn', 'شرایط اسناد انگلیسی', {
            ltr: true,
          })}
          {renderTextarea('winnerFa', 'برنده فارسی')}
          {renderTextarea('winnerEn', 'برنده انگلیسی', { ltr: true })}
        </div>
      </section>

      <footer className="tender-form-actions">
        {onCancel && (
          <button
            type="button"
            className="tender-button tender-button-secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            انصراف
          </button>
        )}

        <button
          type="submit"
          className="tender-button tender-button-primary"
          disabled={isSaving}
        >
          {isSaving
            ? 'در حال ارسال...'
            : isEdit
              ? 'ذخیره تغییرات'
              : 'ثبت مناقصه'}
        </button>
      </footer>
    </form>
  );
};

export default TenderForm;
